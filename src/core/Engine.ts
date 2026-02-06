import * as THREE from "three";
import { Kite } from "../world/Kite";
import { World } from "../world/World";
import { Flower } from "../world/Flower";

export class Engine {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera;
  private width!: number;
  private height!: number;
  private pixelRatio!: number;
  private kite: Kite;
  private flowers: Flower;
  private world: World;
  private mouse = new THREE.Vector2;
  private clock = new THREE.Clock();
  private cameraCenterWorldIntersection = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private targetPoint = new THREE.Vector3();
  private cameraVelocity = new THREE.Vector3();
  private worldBorderRadius = 50;

  private isPaused = false;
  private cameraOffset = new THREE.Vector3(0, 20, 20);
  private desiredCameraPosition = new THREE.Vector3().copy(this.cameraOffset);

  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1);
  private mouseDown = false;
  private cameraMovementSpeed = 0.4;
  private cameraSlowRadius = 2.5;

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>("#c")!;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas
    });
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(this.pixelRatio)

    this.scene = new THREE.Scene();

    const fov = 50;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 20;
    this.camera.position.y = 20;
    this.camera.rotation.x = -Math.PI / 4;
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 100);

    this.world = new World(this.scene, this.worldBorderRadius);
    this.kite = new Kite(this.scene, this.world.bounds);
    this.flowers = new Flower(this.scene, 2000, this.world.size);

    window.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("pointerdown", this.onMouseDown);
    window.addEventListener("pointerup", this.onMouseUp);

    this.createLights();

    window.addEventListener("resize", this.onResize)
    requestAnimationFrame(this.render);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
      this.clock.getDelta();
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    this.mouse.x = (event.clientX / this.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.height) * 2 + 1;
  }

  private onMouseDown = () => {
    this.mouseDown = true;
  }

  private onMouseUp = () => {
    this.mouseDown = false;
  }

  private onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  private createLights() {
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
  }

  private render = () => {
    requestAnimationFrame(this.render);
    if (!this.isPaused) {
      const delta = Math.min(this.clock.getDelta(), 0.05);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.raycaster.ray.intersectPlane(this.groundPlane, this.targetPoint);
      this.kite.setTarget(this.targetPoint);

      this.kite.update(delta);
      this.flowers.update(delta, this.kite.kiteGroup.position, this.kite.velocity, this.cameraCenterWorldIntersection);
      if (this.mouseDown) {
        const clampedTarget = this.targetPoint.clone();
        this.world.clampXZ(clampedTarget);
        this.desiredCameraPosition.copy(clampedTarget).add(this.cameraOffset);
        
        const direction = new THREE.Vector3().subVectors(this.desiredCameraPosition, this.camera.position);
        // const distance = direction.length()  ;
        // if(distance > 0.001) 
        direction.normalize();
        let desiredCameraMovementSpeed = this.cameraMovementSpeed;
        const distanceFromCameraToDesiredPosition = this.camera.position.distanceTo(this.desiredCameraPosition);
        if (distanceFromCameraToDesiredPosition < this.cameraSlowRadius) {
          desiredCameraMovementSpeed = this.cameraMovementSpeed * (distanceFromCameraToDesiredPosition / this.cameraSlowRadius);
        }
        this.cameraVelocity = direction.clone().multiplyScalar(desiredCameraMovementSpeed);
        this.camera.position.add(this.cameraVelocity);
        const center = new THREE.Vector2(0, 0);
        this.raycaster.setFromCamera(center, this.camera);
        this.raycaster.ray.intersectPlane(this.groundPlane, this.cameraCenterWorldIntersection);
      }
      
      this.camera.position.addScaledVector(this.cameraVelocity, this.cameraVelocity.length());
      this.cameraVelocity.multiplyScalar(0.95);
      const center = new THREE.Vector2(0, 0);
      this.raycaster.setFromCamera(center, this.camera);
      this.raycaster.ray.intersectPlane(this.groundPlane, this.cameraCenterWorldIntersection);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
