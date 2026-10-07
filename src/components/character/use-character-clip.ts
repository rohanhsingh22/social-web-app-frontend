import type { CharacterAnimationKind } from "./character-types";

// Animation clip manifest (public/characters/animations/manifest.json).
// GLB clips plug in per animation without touching CharacterRenderer or the
// controller. Procedural fallback runs while a clip URL is null.
const CLIP_URLS: Record<CharacterAnimationKind, string | null> = {
  idle: null,
  wave: null,
  happy: null,
  sad: null,
  celebrate: null,
  "interaction-ready": null,
};

export function useCharacterClip(
  kind: CharacterAnimationKind,
): string | null {
  return CLIP_URLS[kind] ?? null;
}
