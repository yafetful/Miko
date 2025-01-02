import * as THREE from "three";
import { Model } from "./model";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * 3D viewer using three.js
 *
 * Must call setup() with canvas before use
 */
export class Viewer {
  public isReady: boolean;
  public model?: Model;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;
  private _directionalLight: THREE.DirectionalLight;
  private _ambientLight: THREE.AmbientLight;

  constructor() {
    this.isReady = false;

    // scene
    const scene = new THREE.Scene();
    this._scene = scene;

    // light
    this._directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this._directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(this._directionalLight);

    this._ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(this._ambientLight);

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // Disable frustum culling
      this.model.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      this._scene.add(this.model.vrm.scene);

      // Load and start animations
      await this.model.loadAnimations();

      // HACK: Adjust camera position after animation starts due to offset origin
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene.remove(this.model.vrm.scene);
      this.model?.unLoadVrm();
    }
  }

  /**
   * Set up the Canvas managed by React
   */
  public setup(canvas: HTMLCanvasElement) {
    const parentElement = canvas.parentElement;
    const width = parentElement?.clientWidth || canvas.width;
    const height = parentElement?.clientHeight || canvas.height;
    // renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this._renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // camera
    this._camera = new THREE.PerspectiveCamera(
      24.0,    // fov - Field of View, larger value means wider view
      width / height,  // aspect - width/height ratio of the container
      0.1,     // near - objects closer than this won't be rendered
      20.0     // far - objects further than this won't be rendered
    );
    this._camera.position.set(
      0,    // x - left/right position, positive moves right
      1.3,  // y - up/down position, positive moves up
      1.8   // z - front/back position, positive moves back (away from object), negative moves forward
    );
    this._cameraControls?.target.set(
      0,    // x - target point left/right
      1.3,  // y - target point up/down
      0     // z - target point front/back
    );
    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._cameraControls.screenSpacePanning = true;
    this._cameraControls.update();

    window.addEventListener("resize", () => {
      this.resize();
    });
    this.isReady = true;
    this.update();
  }

  /**
   * Resize canvas based on parent element dimensions
   */
  public resize() {
    if (!this._renderer) return;

    const parentElement = this._renderer.domElement.parentElement;
    if (!parentElement) return;

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(
      parentElement.clientWidth,
      parentElement.clientHeight
    );

    if (!this._camera) return;
    this._camera.aspect =
      parentElement.clientWidth / parentElement.clientHeight;
    this._camera.updateProjectionMatrix();
  }

  /**
   * Adjust camera position by referencing VRM's head node
   */
  public resetCamera() {
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");

    if (headNode) {
      const headWPos = headNode.getWorldPosition(new THREE.Vector3());
      this._camera?.position.set(
        this._camera.position.x,
        headWPos.y,
        this._camera.position.z
      );
      this._cameraControls?.target.set(headWPos.x, headWPos.y, headWPos.z);
      this._cameraControls?.update();
    }
  }

  public update = () => {
    requestAnimationFrame(this.update);
    const delta = this._clock.getDelta();
    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }

    if (this._renderer && this._camera) {
      this._renderer.render(this._scene, this._camera);
    }
  };

  public updateLighting(isDarkMode: boolean) {
    const intensity = isDarkMode ? 0.7 : 1.4;
    this._directionalLight.intensity = intensity;
    this._ambientLight.intensity = intensity;
  }

  /**
   * Reset all VRM expressions to neutral state
   */
  public resetExpressions() {
    if (this.model?.vrm?.expressionManager) {
      const manager = this.model.vrm.expressionManager;
      // Reset all possible expressions
      manager.setValue("happy", 0);
      manager.setValue("angry", 0);
      manager.setValue("sad", 0);
      manager.setValue("relaxed", 0);
      manager.setValue("neutral", 1);  // Set neutral as default
      this.model.vrm.update(this._clock.getDelta());
    }
  }
}
