import * as THREE from "three";

export class Flower {
  private scene!: THREE.Scene;
  private flowers: THREE.Group[] = [];
  private time = 0;
  private kiteInfluenceRadius = 5;
  private fogRadius = 5;
  private flowerPatchRadius = 50;

  constructor(scene: THREE.Scene, amountOfFlowers: number) {
    this.scene = scene;
    this.createFlowers(amountOfFlowers);
  }

  private createFlowers(amountOfFlowers: number) {
    for (let i = 0; i < amountOfFlowers; i++) {
      const stemMax = 9;
      const stemMin = 0.5;
      const flowerHeight = Math.random() * (stemMax - stemMin) + stemMin;
      const flowerGroup = new THREE.Group();
      const stemMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, flowerHeight),
        new THREE.MeshBasicMaterial({ color: 0xdee0fc }),
      );
      stemMesh.position.y = flowerHeight / 2;
      flowerGroup.add(stemMesh);
      const bulbMax = 0.2;
      const bulbMin = 0.05;
      const flowerBuld = Math.random() * (bulbMax - bulbMin) + bulbMin;
      const bulbMesh = new THREE.Mesh(
        new THREE.SphereGeometry(flowerBuld, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFF7A3D })
      );

      bulbMesh.position.y = flowerHeight + 0.08;
      flowerGroup.add(bulbMesh);
      flowerGroup.position.set(
        (Math.random() - 0.5) * this.flowerPatchRadius,
        -1,
        (Math.random() - 0.5) * this.flowerPatchRadius
      )

      this.flowers.push(flowerGroup);
      this.scene.add(flowerGroup);
    }
  }

  public update(delta: number, kitePosition: THREE.Vector3, kiteVelocity: THREE.Vector3, clickLocation: THREE.Vector3) {
    this.time += delta;

    this.flowers.forEach((flower) => {
        flower.children.forEach((flowerChild) => {
          if(flowerChild instanceof THREE.Mesh) {

            const distanceToTargetPoint = flower.position.distanceTo(clickLocation);
            const opacity = 1-((distanceToTargetPoint-this.fogRadius)/this.fogRadius);
            flowerChild.material.opacity = THREE.MathUtils.clamp(opacity, 0, 1);
            flowerChild.material.transparent = true;
          }
        });
    });
    if(kiteVelocity.length() > 0.01) {
      this.flowers.forEach((flower, i) => {
        let distance = flower.position.distanceTo(kitePosition);
        let direction = kiteVelocity.clone().normalize();
        if (distance < this.kiteInfluenceRadius) {
          const strength = 1 - (distance / this.kiteInfluenceRadius);
          const zRotationTarget = THREE.MathUtils.clamp(-direction.x * strength, -0.25, 0.25);
          const xRotationTarget = THREE.MathUtils.clamp(direction.z * strength, -0.25, 0.25);
          flower.rotation.z = THREE.MathUtils.lerp(flower.rotation.z, zRotationTarget, delta * 5);
          flower.rotation.x = THREE.MathUtils.lerp(flower.rotation.x, xRotationTarget, delta * 5);
        } else {
          flower.rotation.z = THREE.MathUtils.lerp(flower.rotation.z, Math.sin(this.time * 1.5 + i) * 0.05, delta * 10);
          flower.rotation.x = THREE.MathUtils.lerp(flower.rotation.x, 0, delta * 10);
        }
      });
    } 
  }

}