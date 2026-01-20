import * as THREE from "three";
import { Kite } from "../world/Kite";
import { World } from "../world/World";
import { Flower } from "../world/Flower";

export class Engine {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private cubes: THREE.Mesh[] = [];
  private width!: number;
  private height!: number;
  private pixelRatio!: number;
  private kite: Kite;
  private world: World;
  private flowers: Flower
  

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

    const fov = 75;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 4;
    // this.createObjects();
    
    this.kite = new Kite(this.scene);
    // this.kite.createKite();
    this.world = new World(this.scene);
    // this.world.createWorld();
    this.flowers = new Flower(this.scene, 100);

    this.createLights();
    
    window.addEventListener("resize", this.onResize)
    requestAnimationFrame(this.render);
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

  

  // private createObjects() {
  //   const geometry = new THREE.BoxGeometry(1,1,1);
  //   const makeInstance = (color: THREE.ColorRepresentation ,x: number) => {
  //     const material = new THREE.MeshPhongMaterial({ color });
  //     const cube = new THREE.Mesh(geometry, material);
  //     cube.position.x = x;
  //     this.scene.add(cube);
  //     this.cubes.push(cube);
  //   }
  //   makeInstance(0x44aa88, 0);
  //   makeInstance(0x8844aa, -2);
  //   makeInstance(0xaa8844, 2);
  // }

   private createLights() {
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
  }

  private render = (time: number) => {
    
    this.flowers.flowers.forEach((flower, i) => {
      flower.rotation.z = Math.sin(time + i) * 0.1
    })
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
  

}
