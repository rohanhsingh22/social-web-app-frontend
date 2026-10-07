import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CharacterAnimationKind } from "./character-types";
import {
  getAnimationClip,
  resolveAnimationKind,
} from "./character-animation-manifest";
import { usePageVisible } from "./use-page-visible";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Pose = { rotX: number; rotY: number; posY: number };

const NEUTRAL: Pose = { rotX: 0, rotY: 0, posY: 0 };

function targetPose(kind: CharacterAnimationKind, t: number): Pose {
  void kind;
  void t;
  // Characters stand still: no bobbing, swaying, or hopping. The pose stays
  // neutral in every state (speaking still shows the ring glow). Motion
  // returns with GLB clips later through the lifecycle manager.
  return { ...NEUTRAL };
}

function applyPose(node: Group, pose: Pose): void {
  node.rotation.x = pose.rotX;
  node.rotation.y = pose.rotY;
  node.position.y = pose.posY;
}

// Animation controller (spec §8, Phase 4).
// Procedural pose driver behind a stable interface: the same hook later
// blends GLB clip playback (see character-animation-lifecycle.ts) without
// touching CharacterRenderer. Every state fully specifies its transform each
// frame so switching animations never leaves a stuck tilt or offset.
// - Cross-fades between states over the manifest blend window (task 4).
// - Pauses when the tab is hidden or disabled, writing a neutral pose once
//   (task 6); respects prefers-reduced-motion (task 7).
// - Unknown kinds fall back to idle (task 9); unmount resets the transform
//   so recycled nodes never keep a stale pose (lifecycle, task 5).
export function useCharacterAnimation(
  kind: CharacterAnimationKind = "idle",
  options?: { disabled?: boolean },
) {
  const ref = useRef<Group>(null);
  const shown = useRef<Pose>({ ...NEUTRAL });
  const parked = useRef(false);
  const pageVisible = usePageVisible();
  const resolved = resolveAnimationKind(kind);
  const motionOK = !prefersReducedMotion();
  const active = motionOK && pageVisible && !(options?.disabled ?? false);

  useFrame(({ clock }, delta) => {
    const node = ref.current;
    if (!node) {
      return;
    }
    if (!active) {
      // Park exactly once: no per-frame work while hidden/disabled.
      if (!parked.current) {
        parked.current = true;
        shown.current = { ...NEUTRAL };
        applyPose(node, NEUTRAL);
      }
      return;
    }
    parked.current = false;
    const target = targetPose(resolved, clock.elapsedTime);
    // Exponential blend toward the target pose: ~63% of the distance closes
    // every crossFadeMs window (task 4).
    const blendMs = Math.max(getAnimationClip(resolved).crossFadeMs, 1);
    const dt = Math.min(Math.max(delta, 0), 0.1);
    const alpha = 1 - Math.exp((-dt * 1000) / blendMs);
    const current = shown.current;
    current.rotX += (target.rotX - current.rotX) * alpha;
    current.rotY += (target.rotY - current.rotY) * alpha;
    current.posY += (target.posY - current.posY) * alpha;
    applyPose(node, current);
  });

  // Lifecycle: reset on unmount so a recycled group never keeps a stale pose.
  useEffect(() => {
    const node = ref.current;
    return () => {
      if (node) {
        applyPose(node, NEUTRAL);
      }
      shown.current = { ...NEUTRAL };
      parked.current = false;
    };
  }, []);

  return ref;
}
