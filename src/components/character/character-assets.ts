import { useGLTF } from "@react-three/drei";
import type { CharacterConfig } from "@/types/domain";

// Single source of truth for character GLB urls (spec #70: keep male/female).
export const AVATAR_SRC: Record<CharacterConfig["gender"], string> = {
  male: "/character-scene/male.glb",
  female: "/character-scene/female.glb",
};

// Warm the cache for a gender that is about to render. useGLTF caches by
// url, so only requested genders ever download (spec #109).
export function preloadCharacter(gender: CharacterConfig["gender"]): void {
  useGLTF.preload(AVATAR_SRC[gender]);
}
