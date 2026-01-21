import * as THREE from "three";

export class Kite {
  private scene: THREE.Scene;
  public kiteGroup!: THREE.Group;
  private target = new THREE.Vector3();
  private speed = 1;

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.kiteGroup = new THREE.Group();
    this.createKite();
  }

  private createKite() {
    this.kiteGroup = new THREE.Group();
    const kiteGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( [
      -1.0, 0.0,  0.0, // v0
      0.0, 1.0,  0.0, // v1
      1.0,  0.0,  0.0, // v2

      -1.0,  0.0,  0.0, // v3
      1.0,  0.0,  0.0, // v4
      0.0, -2.0,  0.0  // v5
    ]);

    kiteGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    kiteGeometry.computeVertexNormals();
    const KiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5555,
      side: THREE.DoubleSide
    });
    const kiteBody = new THREE.Mesh(kiteGeometry, KiteMaterial);
    
    kiteBody.position.y = 1;
    this.kiteGroup.add(kiteBody);

    const tailShape = new THREE.CylinderGeometry(0.02, 0.02, 1);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const kiteTail = new THREE.Mesh(tailShape, tailMaterial);
    kiteTail.position.y = -0.8;
    this.kiteGroup.add(kiteTail);
    this.kiteGroup.position.set(0, 0.5, 0)
    this.scene.add(this.kiteGroup);
  }

  public update(delta: number) {
    const direction = new THREE.Vector3()
      .subVectors(this.target, this.kiteGroup.position);

    direction.y = 0; // keep kite above ground

    this.kiteGroup.position.add(
      direction.multiplyScalar(delta * this.speed)
    );

    // Bank into turns
    this.kiteGroup.rotation.z = -direction.x * 0.2;
  }

  public setTarget(point: THREE.Vector3) {
    this.target.copy(point);
  }
}