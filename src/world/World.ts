import * as THREE from "three";

export interface Bounds {
  min: THREE.Vector3,
  max: THREE.Vector3
}

export class World {
  public bounds: Bounds
  private scene!: THREE.Scene;
  
  constructor(scene: THREE.Scene, size: number) {
    this.bounds = {
      min: new THREE.Vector3(-size, 0 , -size),
      max: new THREE.Vector3(size, 0 , size)
    }
    this.scene = scene;
    this.createWorld();
  }


  private createWorld() {
    const worldShape = new THREE.PlaneGeometry(1000, 1000);
    const worldMaterial = new THREE.MeshStandardMaterial({
      color: 0x848cfa,
      side: THREE.DoubleSide
    });
    const worldMesh = new THREE.Mesh(worldShape, worldMaterial);
    worldMesh.rotation.x = -Math.PI / 2
    worldMesh.position.y = -5
    this.scene.add(worldMesh);
  }

  clampXZ(v: THREE.Vector3) {
    v.x = THREE.MathUtils.clamp(v.x, this.bounds.min.x, this.bounds.max.x);
    v.z = THREE.MathUtils.clamp(v.z, this.bounds.min.z, this.bounds.max.z);
    return v;
  }

  get size() {
    return new THREE.Vector3()
      .subVectors(this.bounds.max, this.bounds.min);
  }
}