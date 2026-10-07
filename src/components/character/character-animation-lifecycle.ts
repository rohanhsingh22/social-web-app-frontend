import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  LoopRepeat,
  Object3D,
} from "three";
import {
  getAnimationClip,
  resolveAnimationKind,
} from "./character-animation-manifest";
import { getAnimationClipData } from "./character-clip-cache";

// Clip lifecycle manager (Phase 4, tasks 5+8).
// One manager per character instance owns exactly one mixer and at most one
// live action (task 8: no stacked loops). play() cross-fades out the previous
// action before starting the next (task 4); stop() and dispose() clean up so
// Home unmounts never leak mixers (task 5). Unknown kinds resolve to idle
// (task 9). While no GLB clips ship, play() reports `mode: "procedural"` and
// the procedural controller keeps driving the pose.

export type AnimationPlayMode = "clip" | "procedural";

export class CharacterAnimationLifecycle {
  private mixer: AnimationMixer | null = null;
  private action: AnimationAction | null = null;
  private currentKind: string | null = null;
  private disposed = false;

  constructor(private readonly root: Object3D) {}

  get kind(): string | null {
    return this.currentKind;
  }

  get isPlayingClip(): boolean {
    return this.action !== null && this.action.isRunning();
  }

  /**
   * Play a logical animation. Resolves the clip lazily; falls back to
   * procedural when the clip is missing. Always leaves at most one running
   * action on this instance.
   */
  async play(name: unknown): Promise<{
    mode: AnimationPlayMode;
    kind: string;
  }> {
    if (this.disposed) {
      return { mode: "procedural", kind: "idle" };
    }
    const kind = resolveAnimationKind(name);
    const entry = getAnimationClip(kind);
    const clip = await getAnimationClipData(kind);
    if (this.disposed) {
      return { mode: "procedural", kind: "idle" };
    }
    this.stopAction(entry.crossFadeMs);
    this.currentKind = kind;
    if (!clip) {
      return { mode: "procedural", kind };
    }
    if (!this.mixer) {
      this.mixer = new AnimationMixer(this.root);
    }
    const action = this.mixer.clipAction(clip);
    action.setLoop(entry.loop ? LoopRepeat : LoopOnce, Infinity);
    action.clampWhenFinished = !entry.loop;
    action
      .reset()
      .setEffectiveWeight(1)
      .fadeIn(entry.crossFadeMs / 1000)
      .play();
    this.action = action;
    return { mode: "clip", kind };
  }

  /** Advance the mixer (call from useFrame with delta seconds). */
  update(deltaSeconds: number): void {
    this.mixer?.update(deltaSeconds);
  }

  /** Stop the live action with a fade; keeps the mixer for reuse. */
  stop(fadeMs = 250): void {
    this.stopAction(fadeMs);
    this.currentKind = null;
  }

  /** Tear down: stop everything and drop the mixer (unmount path). */
  dispose(): void {
    this.disposed = true;
    if (this.action) {
      this.action.stop();
      this.action = null;
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.root);
      this.mixer = null;
    }
    this.currentKind = null;
  }

  private stopAction(fadeMs: number): void {
    if (this.action) {
      this.action.fadeOut(Math.max(fadeMs, 0) / 1000);
      this.action = null;
    }
  }
}

/** Test helper: build a mixer-compatible root without a renderer. */
export function createLifecycleTestRoot(): Object3D {
  return new Object3D();
}

export type { AnimationClip };
