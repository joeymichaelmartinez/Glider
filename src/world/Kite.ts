import * as THREE from "three";
import { lerpAngle, angleDifference } from "../utils/MathUtilsHelper";

export class Kite {
  private scene: THREE.Scene;
  public kiteGroup!: THREE.Group;
  public kiteVisual!: THREE.Group;
  private target = new THREE.Vector3();
  private speed = 15;
  private lastHeading = 0;
  private slowRadius = 2.5;   // start slowing down
  private stopRadius = 0.05; // consider "arrived"
  private floatTime = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.kiteGroup = new THREE.Group();
    this.createKite();
  }

  private createKite() {
    this.kiteGroup = new THREE.Group();
    this.kiteVisual = new THREE.Group();
    const kiteGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -1.0, 0.0, 0.0, // v0
      0.0, 0.0, 1.0, // v1
      1.0, 0.0, 0.0, // v2

      -1.0, 0.0, 0.0, // v3
      1.0, 0.0, 0.0, // v4
      0.0, 0.0, -2.0  // v5
    ]);

    kiteGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    kiteGeometry.computeVertexNormals();
    const KiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5555,
      side: THREE.DoubleSide
    });
    const kiteBody = new THREE.Mesh(kiteGeometry, KiteMaterial);

    this.kiteVisual.add(kiteBody);

    const tailShape = new THREE.CylinderGeometry(0.02, 0.02, 1);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const kiteTail = new THREE.Mesh(tailShape, tailMaterial);
    kiteTail.rotation.x = Math.PI / 2;
    kiteTail.position.z = -1.8;
    this.kiteVisual.add(kiteTail);
    this.kiteGroup.add(this.kiteVisual);

    this.scene.add(this.kiteGroup);
  }

  public update(delta: number) {

    this.floatTime += delta;

    this.kiteGroup.position.y =
      1 + Math.sin(this.floatTime * 0.75) * 0.5;
    
    const direction = new THREE.Vector3()
      .subVectors(this.target, this.kiteGroup.position);

    direction.y = 0;

    const distance = direction.length();
    const arrived = distance < this.stopRadius;
    let desiredSpeed = this.speed;
    if (distance < this.slowRadius) {
      desiredSpeed = this.speed * (distance / this.slowRadius);
    }
    if(!arrived) {
      
      direction.normalize();
  
      // Move
      this.kiteGroup.position.addScaledVector(
        direction,
        desiredSpeed * delta
      );
  
      // Turn in XZ plane (yaw)
      const heading = Math.atan2(direction.x, direction.z);
  
      this.kiteGroup.rotation.y = lerpAngle(
        this.kiteGroup.rotation.y,
        heading,
        delta * 5
      );
  
  
      const turnRate = angleDifference(
        this.lastHeading,
        heading
      );
      this.lastHeading = heading;
  
      // Bank visually (roll)
      const rollTarget = THREE.MathUtils.clamp(
        -turnRate * 3.0,   // strength
        -1,
        1
      );
  
      this.kiteVisual.rotation.z = THREE.MathUtils.lerp(
        this.kiteVisual.rotation.z,
        rollTarget,
        delta * 6
      );
    }
  }

  public setTarget(point: THREE.Vector3) {
    this.target.copy(point);
  }
}