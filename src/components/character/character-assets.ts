import { useGLTF } from "@react-three/drei";

// Stable-ID model registry (Phase 2 migration).
// The character identity key is ALWAYS the stable character ID — never
// gender. Each entry carries the final Quaternius URL first and the shipped
// compatibility GLB as fallback, mirroring
// public/hirotoli/manifests/character-manifest.json and
// public/characters/base/<id>/pointer.json.
//
// FINAL_MODELS_AVAILABLE flips to true the moment the final GLBs land under
// public/hirotoli/characters/base/. No other code change is needed: every
// consumer resolves through resolveModelUrl().

export type CharacterModelSource = {
  url: string;
  fallbackUrl: string;
  rigId: string;
};

export const CHARACTER_MODEL_SRC: Record<string, CharacterModelSource> = {
  "character-01": {
    url: "/hirotoli/characters/base/character-01/model.glb",
    fallbackUrl: "/character-scene/female.glb",
    rigId: "humanoid-v1",
  },
  "character-02": {
    url: "/hirotoli/characters/base/character-02/model.glb",
    fallbackUrl: "/character-scene/male.glb",
    rigId: "humanoid-v1",
  },
};

export const FALLBACK_CHARACTER_ID = "character-01";

// Set true when final binaries are committed (Phase 2 step 1). Until then
// every character renders from the compatibility fallback and existing users
// keep their selection (exit criteria).
export const FINAL_MODELS_AVAILABLE = false;

function sourceFor(characterId: string): CharacterModelSource {
  return (
    CHARACTER_MODEL_SRC[characterId] ??
    CHARACTER_MODEL_SRC[FALLBACK_CHARACTER_ID]!
  );
}

/** Resolve the runnable GLB url for a stable character ID (never throws). */
export function resolveModelUrl(characterId: string): string {
  const src = sourceFor(characterId);
  return FINAL_MODELS_AVAILABLE ? src.url : src.fallbackUrl;
}

/** Expected rig for a stable character ID (validation gate, Phase 2). */
export function expectedRigId(characterId: string): string {
  return sourceFor(characterId).rigId;
}

/** Warm the cache for a character that is about to render. */
export function preloadCharacterById(characterId: string): void {
  useGLTF.preload(resolveModelUrl(characterId));
}

// ---------------------------------------------------------------------------
// Legacy gender-keyed shims. Kept ONLY for old CharacterConfig payloads until
// every stored config migrates (Phase 2 step 12). New code must use the
// stable-ID helpers above.
// ---------------------------------------------------------------------------

// Single source of truth for character GLB urls (spec #70: keep male/female).
export const AVATAR_SRC: Record<"male" | "female", string> = {
  male: CHARACTER_MODEL_SRC["character-02"]!.fallbackUrl,
  female: CHARACTER_MODEL_SRC["character-01"]!.fallbackUrl,
};

// Warm the cache for a gender that is about to render. useGLTF caches by
// url, so only requested genders ever download (spec #109).
export function preloadCharacter(gender: "male" | "female"): void {
  useGLTF.preload(AVATAR_SRC[gender]);
}
