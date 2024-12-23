import { VRMHumanoid, VRMLookAt, VRMLookAtApplier } from "@pixiv/three-vrm";
import * as THREE from "three";

/** 眼球跳动（扫视）发生的最小间隔 */
const SACCADE_MIN_INTERVAL = 0.5;

/**
 * 眼球跳动发生的概率
 */
const SACCADE_PROC = 0.05;

/** 眼球跳动的范围半径。这是传递给lookAt的值，不是实际的眼球移动半径，所以稍大一些。单位：度 */
const SACCADE_RADIUS = 5.0;

const _v3A = new THREE.Vector3();
const _quatA = new THREE.Quaternion();
const _eulerA = new THREE.Euler();

/**
 * 为 `VRMLookAt` 添加以下功能:
 *
 * - 当分配了 `userTarget` 时，会平滑地转向用户方向
 * - 不仅使用眼球，还会通过头部旋转来实现注视
 * - 添加眼球的扫视运动
 */
export class VRMLookAtSmoother extends VRMLookAt {
  /** 平滑过渡的系数 */
  public smoothFactor = 4.0;

  /** 注视用户的最大角度限制（单位：度） */
  public userLimitAngle = 90.0;

  /** 用户目标位置。原有的 `target` 用于动画 */
  public userTarget?: THREE.Object3D | null;

  /** 设置为 `false` 可以禁用眼球扫视 */
  public enableSaccade: boolean;

  /** 存储眼球扫视的水平移动方向 */
  private _saccadeYaw = 0.0;

  /** 存储眼球扫视的垂直移动方向 */
  private _saccadePitch = 0.0;

  /** 当此计时器超过 SACCADE_MIN_INTERVAL 时，会以 SACCADE_PROC 的概率触发眼球扫视 */
  private _saccadeTimer = 0.0;

  /** 用于平滑处理的水平角度 */
  private _yawDamped = 0.0;

  /** 用于平滑处理的垂直角度 */
  private _pitchDamped = 0.0;

  /** 临时存储第一人称骨骼的旋转值 */
  private _tempFirstPersonBoneQuat = new THREE.Quaternion();

  public constructor(humanoid: VRMHumanoid, applier: VRMLookAtApplier) {
    super(humanoid, applier);

    this.enableSaccade = true;
  }

  public update(delta: number): void {
    if (this.target && this.autoUpdate) {
      // 更新动画的视线方向
      // 更新 `_yaw` 和 `_pitch` 值
      this.lookAt(this.target.getWorldPosition(_v3A));

      // 动画指定的水平/垂直角度。在此函数内不变
      const yawAnimation = this._yaw;
      const pitchAnimation = this._pitch;

      // 此帧最终使用的水平/垂直角度
      let yawFrame = yawAnimation;
      let pitchFrame = pitchAnimation;

      // 处理用户注视
      if (this.userTarget) {
        // 更新 `_yaw` 和 `_pitch` 值
        this.lookAt(this.userTarget.getWorldPosition(_v3A));

        // 角度限制。如果超过 `userLimitAngle`，则使用动画指定的方向
        if (
          this.userLimitAngle < Math.abs(this._yaw) ||
          this.userLimitAngle < Math.abs(this._pitch)
        ) {
          this._yaw = yawAnimation;
          this._pitch = pitchAnimation;
        }

        // 平滑处理 yawDamped 和 pitchDamped
        const k = 1.0 - Math.exp(-this.smoothFactor * delta);
        this._yawDamped += (this._yaw - this._yawDamped) * k;
        this._pitchDamped += (this._pitch - this._pitchDamped) * k;

        // 与动画进行混合
        // 当动画指定了侧面视角时，优先考虑动画的方向
        const userRatio =
          1.0 -
          THREE.MathUtils.smoothstep(
            Math.sqrt(
              yawAnimation * yawAnimation + pitchAnimation * pitchAnimation
            ),
            30.0,
            90.0
          );

        // 将结果赋值给 yawFrame / pitchFrame
        yawFrame = THREE.MathUtils.lerp(
          yawAnimation,
          0.6 * this._yawDamped,
          userRatio
        );
        pitchFrame = THREE.MathUtils.lerp(
          pitchAnimation,
          0.6 * this._pitchDamped,
          userRatio
        );

        // 旋转头部
        _eulerA.set(
          -this._pitchDamped * THREE.MathUtils.DEG2RAD,
          this._yawDamped * THREE.MathUtils.DEG2RAD,
          0.0,
          VRMLookAt.EULER_ORDER
        );
        _quatA.setFromEuler(_eulerA);

        const head = this.humanoid.getRawBoneNode("head")!;
        this._tempFirstPersonBoneQuat.copy(head.quaternion);
        head.quaternion.slerp(_quatA, 0.4);
        head.updateMatrixWorld();
      }

      if (this.enableSaccade) {
        // 计算眼球扫视的移动方向
        if (
          SACCADE_MIN_INTERVAL < this._saccadeTimer &&
          Math.random() < SACCADE_PROC
        ) {
          this._saccadeYaw = (2.0 * Math.random() - 1.0) * SACCADE_RADIUS;
          this._saccadePitch = (2.0 * Math.random() - 1.0) * SACCADE_RADIUS;
          this._saccadeTimer = 0.0;
        }

        this._saccadeTimer += delta;

        // 添加眼球扫视的移动量
        yawFrame += this._saccadeYaw;
        pitchFrame += this._saccadePitch;

        // 传递给应用器
        this.applier.applyYawPitch(yawFrame, pitchFrame);
      }

      // 已经应用过了，这一帧内不需要再更新
      this._needsUpdate = false;
    }

    // 不使用target控制lookAt的情况
    if (this._needsUpdate) {
      this._needsUpdate = false;
      this.applier.applyYawPitch(this._yaw, this._pitch);
    }
  }

  /** 渲染后调用此方法以恢复头部旋转 */
  public revertFirstPersonBoneQuat(): void {
    if (this.userTarget) {
      const head = this.humanoid.getNormalizedBoneNode("head")!;
      head.quaternion.copy(this._tempFirstPersonBoneQuat);
    }
  }
}
