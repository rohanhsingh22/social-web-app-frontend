import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CharacterAnimationKind } from "./character-types";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Animation controller (spec §8). Animations stay independent from the base
// model: today this is procedural (GLBs ship no clips) with the 6 launch
// states; tomorrow the same interface drives GLB clips without touching
// CharacterRenderer. Respects prefers-reduced-motion.
export function useCharacterAnimation(
  kind: CharacterAnimationKind = "idle",
  options?: { disabled?: boolean },
) {
  const ref = useRef<Group>(null);
  const disabled = options?.disabled ?? prefersReducedMotion();

  useFrame(({ clock }) => {
    const node = ref.current;
    if (!node || disabled) {
      return;
    }
    const t = clock.elapsedTime;
    // Every state fully specifies its transform each frame so switching
    // animations (e.g. sad -> idle) never leaves a stuck tilt or offset.
    node.rotation.x = 0;
    switch (kind) {
      case "wave":
        node.rotation.y = Math.sin(t * 1.2) * 0.12;
        node.position.y = Math.abs(Math.sin(t * 2)) * 0.04;
        break;
      case "happy":
      case "celebrate":
        node.rotation.y = 0;
        node.position.y = Math.abs(Math.sin(t * 3)) * 0.08;
        break;
      case "sad":
        node.rotation.y = 0;
        node.position.y = -0.02;
        node.rotation.x = 0.04;
        break;
      case "interaction-ready":
        node.rotation.y = Math.sin(t * 0.8) * 0.08;
        node.position.y = 0;
        break;
      case "idle":
      default:
        node.rotation.y = 0;
        node.position.y = Math.sin(t * 1.4) * 0.02;
        break;
    }
  });

  return ref;
}
