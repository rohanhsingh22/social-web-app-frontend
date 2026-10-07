import type { CharacterAnimationKind } from "./character-types";

export type { CharacterAnimationKind } from "./character-types";

// Animation clip manifest (Phase 4, task 1).
// Single source of truth for logical-name -> clip mapping (task 3).
// Mirrors public/characters/animations/manifest.json and the backend
// GET /characters/animations allowlist. Clip URLs stay null until the
// Quaternius GLB clips land (Phase 1 approval) — the controller and the
// lifecycle manager treat null as "procedural fallback", so adding clips is
// a manifest-only change (task 2: clips always resolve lazily, never in the
// initial bundle).

export type AnimationClipEntry = {
  kind: CharacterAnimationKind;
  /** GLB clip URL, or null while the procedural fallback owns this state. */
  url: string | null;
  loop: boolean;
  /** Task 4 — blend window when entering this state. */
  crossFadeMs: number;
};

export const ANIMATION_MANIFEST: AnimationClipEntry[] = [
  { kind: "idle", url: null, loop: true, crossFadeMs: 250 },
  { kind: "wave", url: null, loop: false, crossFadeMs: 250 },
  { kind: "happy", url: null, loop: false, crossFadeMs: 250 },
  { kind: "sad", url: null, loop: false, crossFadeMs: 250 },
  { kind: "celebrate", url: null, loop: false, crossFadeMs: 250 },
  { kind: "interaction-ready", url: null, loop: false, crossFadeMs: 250 },
];

export const ANIMATION_MAP = new Map(
  ANIMATION_MANIFEST.map((entry) => [entry.kind, entry]),
);

/** Task 9 — unknown names fall back to idle (never throws). */
export function resolveAnimationKind(name: unknown): CharacterAnimationKind {
  if (typeof name === "string" && ANIMATION_MAP.has(name as CharacterAnimationKind)) {
    return name as CharacterAnimationKind;
  }
  return "idle";
}

export function getAnimationClip(
  kind: CharacterAnimationKind,
): AnimationClipEntry {
  return ANIMATION_MAP.get(kind) ?? ANIMATION_MAP.get("idle")!;
}

/** Test seam: point a kind at a fake clip URL (reset to null after). */
export function setAnimationClipUrlForTests(
  kind: CharacterAnimationKind,
  url: string | null,
): void {
  const entry = ANIMATION_MAP.get(kind);
  if (entry) {
    entry.url = url;
  }
}
