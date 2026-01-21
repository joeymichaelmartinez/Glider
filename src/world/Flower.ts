import * as THREE from "three";

export class Flower {
  private scene!: THREE.Scene;
  private flowers: THREE.Group[] = [];

  constructor(scene: THREE.Scene, amountOfFlowers: number) {
    this.scene = scene;
    this.createFlowers(amountOfFlowers);
  }

  private createFlowers(amountOfFlowers: number) {
    for (let i = 0; i < amountOfFlowers; i++) {
      const flowerGroup = new THREE.Group();
      const stemMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x33aa55 })
      );
      stemMesh.position.y = 0.25;
      flowerGroup.add(stemMesh);

      const bulbMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffcc55 })
      );
      bulbMesh.position.y = 0.55
      flowerGroup.add(bulbMesh);
      flowerGroup.position.set(
        (Math.random() - 0.5) * 20,
        -1,
        (Math.random() - 0.5) * 20
      )


      this.flowers.push(flowerGroup);
      this.scene.add(flowerGroup);
    }
  }

  public update(delta: number) {
    // this.flowers.forEach((flower, i) => {
    //   flower.rotation.z += Math.sin(i) * delta * 0.2;
    // });
  }

}