import * as THREE from "three";

export class Flower {
  private scene!: THREE.Scene;
  private flowerPatchRadius: number;

  private stemMesh!: THREE.InstancedMesh;
  private stemDummy = new THREE.Object3D();
  private stemHeights: number[] = [];
  
  // Separate meshes for each color
  private yellowBulbMesh!: THREE.InstancedMesh;
  private orangeBulbMesh!: THREE.InstancedMesh;
  private bulbDummy = new THREE.Object3D();
  private bulbScales: THREE.Vector3[] = [];
  private bulbColors: ('yellow' | 'orange')[] = [];

  private time = 0;
  private kiteInfluenceRadius = 6;
  
  private fogRadius = 7;
  private fogFalloff = 5;
  private fogCenter = new THREE.Vector3();

  constructor(scene: THREE.Scene, amountOfFlowers: number, worldSize: THREE.Vector3) {
    this.scene = scene;
    this.flowerPatchRadius = worldSize.x;
    this.createFlowers(amountOfFlowers);
  }

  private createFlowers(amountOfFlowers: number) {
    const stemGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1);
    stemGeometry.translate(0, 0.5, 0);
    
    const bulbGeometry = new THREE.SphereGeometry(1, 8, 8);
    
    // Custom shader material for fog effect
    const createFogMaterial = (color: number) => { //ask about this
      return new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(color) },
          fogCenter: { value: this.fogCenter },
          fogRadius: { value: this.fogRadius },
          fogFalloff: { value: this.fogFalloff }
        },
        transparent: true,
        vertexShader: `
          varying vec3 vPosition;
          
          void main() {
            vPosition = (instanceMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform vec3 fogCenter;
          uniform float fogRadius;
          uniform float fogFalloff;
          
          varying vec3 vPosition;
          
          void main() {
            float dist = distance(vPosition.xz, fogCenter.xz);
            float opacity = 1.0 - clamp((dist - fogRadius) / fogFalloff, 0.0, 1.0);
            gl_FragColor = vec4(color, opacity);
          }
        `
      });
    };
    
    const stemMaterial = createFogMaterial(0xdee0fc);
    const yellowMaterial = createFogMaterial(0xFFAA00);
    const orangeMaterial = createFogMaterial(0xFF7A3D);

    this.stemMesh = new THREE.InstancedMesh(
      stemGeometry,
      stemMaterial,
      amountOfFlowers
    );
    
    this.yellowBulbMesh = new THREE.InstancedMesh(
      bulbGeometry,
      yellowMaterial,
      amountOfFlowers
    );
    
    this.orangeBulbMesh = new THREE.InstancedMesh(
      bulbGeometry,
      orangeMaterial,
      amountOfFlowers
    );
    
    let yellowCount = 0;
    let orangeCount = 0;
    
    for (let i = 0; i < amountOfFlowers; i++) {
      const stemMax = 7;
      const stemMin = 0.5;
      const flowerHeight = Math.random() * (stemMax - stemMin) + stemMin;
      this.stemHeights.push(flowerHeight);

      const bulbMin = 0.05;
      const bulbMax = 0.2;
      const flowerBulb = THREE.MathUtils.randFloat(bulbMin, bulbMax);
      const bulbScale = new THREE.Vector3(flowerBulb, flowerBulb, flowerBulb);
      this.bulbScales.push(bulbScale);

      const flowerPosition = new THREE.Vector3(
        (Math.random() - 0.5) * this.flowerPatchRadius,
        -4,
        (Math.random() - 0.5) * this.flowerPatchRadius
      );
      
      // Set stem matrix
      this.stemDummy.position.copy(flowerPosition);
      this.stemDummy.scale.set(1, flowerHeight, 1);
      this.stemDummy.updateMatrix();
      this.stemMesh.setMatrixAt(i, this.stemDummy.matrix);
      
      // Randomly choose color and set in appropriate mesh
      const isYellow = Math.random() > 0.5;
      this.bulbColors.push(isYellow ? 'yellow' : 'orange');
      
      this.bulbDummy.position.copy(flowerPosition).add(new THREE.Vector3(0, flowerHeight, 0));
      this.bulbDummy.scale.copy(bulbScale);
      this.bulbDummy.updateMatrix();
      
      if (isYellow) {
        this.yellowBulbMesh.setMatrixAt(yellowCount, this.bulbDummy.matrix);
        yellowCount++;
      } else {
        this.orangeBulbMesh.setMatrixAt(orangeCount, this.bulbDummy.matrix);
        orangeCount++;
      }
    }
    
    // Set the actual count for each mesh
    this.yellowBulbMesh.count = yellowCount;
    this.orangeBulbMesh.count = orangeCount;
    
    this.stemMesh.instanceMatrix.needsUpdate = true;
    this.yellowBulbMesh.instanceMatrix.needsUpdate = true;
    this.orangeBulbMesh.instanceMatrix.needsUpdate = true;
    
    this.scene.add(this.stemMesh);
    this.scene.add(this.yellowBulbMesh);
    this.scene.add(this.orangeBulbMesh);
  }

  public update(
    delta: number,
    kitePosition: THREE.Vector3,
    kiteVelocity: THREE.Vector3,
    cameraCenterWorldIntersection: THREE.Vector3
  ) {
    this.time += delta;
    
    // Update fog center
    this.fogCenter.copy(cameraCenterWorldIntersection);

    let yellowIndex = 0;
    let orangeIndex = 0;

    for (let i = 0; i < this.stemMesh.count; i++) {
      // --- STEM ---
      this.stemMesh.getMatrixAt(i, this.stemDummy.matrix);
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      this.stemDummy.matrix.decompose(position, quaternion, scale);

      const distance = position.distanceTo(kitePosition);
      const direction = kiteVelocity.clone().normalize();

      let xRot = 0;
      let zRot = 0;

      if (distance < this.kiteInfluenceRadius) {
        const strength = 1 - distance / this.kiteInfluenceRadius;
        xRot = THREE.MathUtils.clamp(direction.z * strength, -0.25, 0.25);
        zRot = THREE.MathUtils.clamp(-direction.x * strength, -0.25, 0.25);
      } else {
        // Idle sway
        xRot = Math.sin(this.time * 1.2 + i) * 0.05;
        zRot = Math.sin(this.time * 1.5 + i) * 0.05;
      }

      const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(xRot, 0, zRot));
      quaternion.slerp(targetQuat, delta * 5);

      this.stemDummy.matrix.compose(position, quaternion, scale);
      this.stemMesh.setMatrixAt(i, this.stemDummy.matrix);

      // --- BULB ---
      const topOfStem = new THREE.Vector3(0, scale.y, 0).applyQuaternion(quaternion);
      const bulbPosition = position.clone().add(topOfStem);
      const bulbScale = this.bulbScales[i].clone();

      this.bulbDummy.matrix.compose(bulbPosition, quaternion, bulbScale);
      
      // Update the appropriate mesh based on color
      if (this.bulbColors[i] === 'yellow') {
        this.yellowBulbMesh.setMatrixAt(yellowIndex, this.bulbDummy.matrix);
        yellowIndex++;
      } else {
        this.orangeBulbMesh.setMatrixAt(orangeIndex, this.bulbDummy.matrix);
        orangeIndex++;
      }
    }

    this.stemMesh.instanceMatrix.needsUpdate = true;
    this.yellowBulbMesh.instanceMatrix.needsUpdate = true;
    this.orangeBulbMesh.instanceMatrix.needsUpdate = true;
  }
}