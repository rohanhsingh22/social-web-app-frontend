import type { CharacterAnimationKind } from "./character-types";
import {
  ANIMATION_MANIFEST,
  getAnimationClip,
} from "./character-animation-manifest";

// Animation clip manifest (public/characters/animations/manifest.json).
// GLB clips plug in per animation without touching CharacterRenderer or the
// controller. Procedural fallback runs while a clip URL is null.
// (Delegates to character-animation-manifest.ts — the single source of
// truth for logical-name -> clip mapping.)
export function useCharacterClip(
  kind: CharacterAnimationKind,
): string | null {
  return getAnimationClip(kind).url;
}

export { ANIMATION_MANIFEST };
