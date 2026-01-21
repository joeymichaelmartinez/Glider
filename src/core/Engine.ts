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
  private world: World;
  private flowers: Flower;
  
  private lastTime = 0;
  private mouse = new THREE.Vector2;
  private raycaster = new THREE.Raycaster();
  private targetPoint = new THREE.Vector3();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0,1,0), 1);

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
    this.camera.position.y = 10;
    this.camera.rotation.x = -Math.PI / 6;
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 100);
    
    this.kite = new Kite(this.scene);
    this.world = new World(this.scene);
    this.flowers = new Flower(this.scene, 100);

    window.addEventListener("mousemove", this.onMouseMove);
    // const helper = new THREE.AxesHelper(2);
    // this.scene.add(helper);

    this.createLights();
    
    window.addEventListener("resize", this.onResize)
    requestAnimationFrame(this.render);
  }

  private onMouseMove = (event: MouseEvent) => {
    this.mouse.x = (event.clientX/this.width) * 2 - 1;
    this.mouse.y = -(event.clientY/this.height) * 2 + 1;
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

  private render = (time: number) => {
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(this.groundPlane, this.targetPoint);
    this.kite.setTarget(this.targetPoint);
   
    this.kite.update(delta);
    this.flowers.update(delta);
   
    // const desiredPosition = new THREE.Vector3().copy(this.kite.kiteGroup.position);
    // desiredPosition.add(new THREE.Vector3(0,10,10));

    // this.camera.position.lerp(desiredPosition, 0.1);
    // this.camera.lookAt(this.kite.kiteGroup.position);
   
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
}
