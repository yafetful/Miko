import * as THREE from "three";
import { Model } from "./model";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
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

      // 加载并开始播放动画
      await this.model.loadAnimations();

      // HACK: アニメーションの原点がずれているので再生後にカメラ位置を調整する
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
   * Reactで管理しているCanvasを後から設定する
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
      24.0,    // fov (Field of View) - 视野角度，值越大视野越广
      width / height,  // aspect - 宽高比，通常是容器的宽度除以高度
      0.1,     // near - 近平面，小于这个距离的物体不会被渲染
      20.0     // far - 远平面，大于这个距离的物体不会被渲染
    );
    this._camera.position.set(
      0,    // x - 左右位置，正值向右移动
      1.3,  // y - 上下位置，正值向上移动
      1.8   // z - 前后位置，正值向后移动（远离物体），负值向前移动（靠近物体）
    );
    this._cameraControls?.target.set(
      0,    // x - 目标点的左右位置
      1.3,  // y - 目标点的上下位置
      0     // z - 目标点的前后位置
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
   * canvasの親要素を参照してサイズを変更する
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
   * VRMのheadノードを参照してカメラ位置を調整する
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
}
