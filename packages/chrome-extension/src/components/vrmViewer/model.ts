import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMAnimation } from "../../lib/VRMAnimation/VRMAnimation";
import { VRMLookAtSmootherLoaderPlugin } from "../../lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";
import { LipSync } from "../lipSync/lipSync";
import { EmoteController } from "../emoteController/emoteController";
import { Screenplay } from "../messages/messages";
import { loadVRMAnimation } from "../../lib/VRMAnimation/loadVRMAnimation";
import { buildUrl } from "../../utils/buildUrl";


/**
 * 3Dキャラクターを管理するクラス
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public emoteController?: EmoteController;

  private _lookAtTargetParent: THREE.Object3D;
  private _lipSync?: LipSync;
  private _currentAnimation?: THREE.AnimationAction;
  private _animations: THREE.AnimationAction[] = [];
  private _animationTimer?: number;
  private _idleAnimation?: THREE.AnimationAction;
  private _actionAnimations: THREE.AnimationAction[] = [];

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
    this._lipSync = new LipSync(new AudioContext());
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.register(
      (parser) =>
        new VRMLoaderPlugin(parser, {
          lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
        })
    );

    const gltf = await loader.loadAsync(url);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = "VRMRoot";

    VRMUtils.rotateVRM0(vrm);
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    this.emoteController = new EmoteController(vrm, this._lookAtTargetParent);
  }

  public unLoadVrm() {
    if (this._animationTimer) {
      window.clearTimeout(this._animationTimer);
    }
    this._actionAnimations = [];
    this._currentAnimation = undefined;
    this._idleAnimation = undefined;
    
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
  }

  /**
   * VRMアニメーションを読み込む
   *
   * https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md
   */
  public async loadAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    const clip = vrmAnimation.createAnimationClip(vrm);
    const action = mixer.clipAction(clip);
    action.play();
  }

  /**
   * 音声を再生し、リップシンクを行う
   */
  public async speak(buffer: ArrayBuffer, screenplay: Screenplay) {
    this.emoteController?.playEmotion(screenplay.expression);
    await new Promise((resolve) => {
      this._lipSync?.playFromArrayBuffer(buffer, () => {
        resolve(true);
      });
    });
  }

  public update(delta: number): void {
    if (this._lipSync) {
      const { volume } = this._lipSync.update();
      this.emoteController?.lipSync("aa", volume);
    }

    this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }

  // 加载所有动画
  public async loadAnimations() {
    if (!this.vrm || !this.mixer) return;

    // 首先加载 idle 动画
    try {
      const idleVrma = await loadVRMAnimation(buildUrl("/vrma/idle_loop.vrma"));
      if (idleVrma) {
        const clip = idleVrma.createAnimationClip(this.vrm);
        this._idleAnimation = this.mixer.clipAction(clip);
        // 立即播放 idle 动画
        this._idleAnimation.play();
        this._currentAnimation = this._idleAnimation;
      }
    } catch (error) {
      console.error('Error loading idle animation:', error);
    }

    // 加载动作动画
    const actionFiles = [
      '/vrma/VRMA_01.vrma',
      '/vrma/VRMA_02.vrma',
      '/vrma/VRMA_03.vrma',
      '/vrma/VRMA_04.vrma',
      '/vrma/VRMA_05.vrma',
      '/vrma/VRMA_06.vrma',
      '/vrma/VRMA_07.vrma',
    ];

    for (const file of actionFiles) {
      try {
        const vrma = await loadVRMAnimation(buildUrl(file));
        if (vrma) {
          const clip = vrma.createAnimationClip(this.vrm);
          const action = this.mixer.clipAction(clip);
          this._actionAnimations.push(action);
        }
      } catch (error) {
        console.error(`Error loading animation ${file}:`, error);
      }
    }
  }

  // 播放随机动作
  public playRandomAction() {
    if (this._actionAnimations.length === 0 || !this._idleAnimation) return;

    // 清除之前的定时器
    if (this._animationTimer) {
      window.clearTimeout(this._animationTimer);
    }

    // 停止当前动画
    if (this._currentAnimation) {
      this._currentAnimation.fadeOut(0.5);
    }

    // 随机选择新动画
    const randomIndex = Math.floor(Math.random() * this._actionAnimations.length);
    const actionAnimation = this._actionAnimations[randomIndex];

    // 播放动作动画
    actionAnimation.reset();
    actionAnimation.fadeIn(0.5);
    actionAnimation.play();
    this._currentAnimation = actionAnimation;

    // 设置定时器，动作播放完后回到 idle
    this._animationTimer = window.setTimeout(() => {
      this.returnToIdle();
    }, 3000); // 3秒后回到 idle
  }

  // 返回到 idle 动画
  private returnToIdle() {
    if (!this._idleAnimation) return;

    if (this._currentAnimation) {
      this._currentAnimation.fadeOut(0.5);
    }

    this._idleAnimation.reset();
    this._idleAnimation.fadeIn(0.5);
    this._idleAnimation.play();
    this._currentAnimation = this._idleAnimation;
  }
}
