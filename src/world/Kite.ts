import * as THREE from "three";

export class Kite {
  private scene: THREE.Scene;
  private kiteGroup!: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.kiteGroup = new THREE.Group();
    this.createKite();
  }

  private createKite() {
    this.kiteGroup = new THREE.Group();
    const kiteShape = new THREE.PlaneGeometry(1, 1);
    const KiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5555,
      side: THREE.DoubleSide
    });
    const kiteBody = new THREE.Mesh(kiteShape, KiteMaterial);
    kiteBody.rotation.z = Math.PI / 4;
    this.kiteGroup.add(kiteBody);

    const tailShape = new THREE.CylinderGeometry(0.02, 0.02, 1);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const kiteTail = new THREE.Mesh(tailShape, tailMaterial);
    kiteTail.position.y = -0.8;
    this.kiteGroup.add(kiteTail);
    this.kiteGroup.position.set(0, 0.5, 0)
    this.scene.add(this.kiteGroup);
  }
}