import * as THREE from "three";

export class Flower {
  private scene!: THREE.Scene;
  private flowers: THREE.Group[] = [];
  private time = 0;
  private kiteInfluenceRadius = 3;

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
        new THREE.MeshBasicMaterial({ color: 0xdee0fc })
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
        (Math.random() - 0.5) * 15,
        -1,
        (Math.random() - 0.5) * 15
      )

      this.flowers.push(flowerGroup);
      this.scene.add(flowerGroup);
    }
  }

  public update(delta: number, kitePosition: THREE.Vector3, kiteVelocity: THREE.Vector3) {
    this.time += delta;

    this.flowers.forEach((flower, i) => {
      flower.rotation.z = Math.sin(this.time * 1.5 + i) * 0.05;
      if(flower.position.length() > 4) {
        flower.children.forEach((flowerChild) => {
          if(flowerChild instanceof THREE.Mesh) {
            flowerChild.material.opacity = 1-((flower.position.length()-4)/4);
            console.log(flowerChild.material.opacity);
            flowerChild.material.transparent = true;
          }
        });
      }
    });
    if(kiteVelocity.length() > 0.01) {
      this.flowers.forEach((flower) => {
        let distance = flower.position.distanceTo(kitePosition);
        let direction = kiteVelocity.clone().normalize();
        if (distance < this.kiteInfluenceRadius) {
          flower.rotation.z = THREE.MathUtils.clamp(-direction.x * (1 - (distance / this.kiteInfluenceRadius)), -0.1, 0.1);
          flower.rotation.x = THREE.MathUtils.clamp(direction.z * (1 - (distance / this.kiteInfluenceRadius)), -0.1, 0.1);
        }
      });
    }
  }

}