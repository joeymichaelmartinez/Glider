import * as THREE from "three";

export class World {
  private scene!: THREE.Scene;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createWorld();
  }


  private createWorld() {
    const worldShape = new THREE.PlaneGeometry(50, 50);
    const worldMaterial = new THREE.MeshStandardMaterial({
      color: 0x0000FF,
      side: THREE.DoubleSide
    });
    const worldMesh = new THREE.Mesh(worldShape, worldMaterial);
    worldMesh.rotation.x = -Math.PI / 2
    worldMesh.position.y = -1
    this.scene.add(worldMesh);
  }
}