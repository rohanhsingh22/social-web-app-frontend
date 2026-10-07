import type { AnimationClip } from "three";
import {
  getAnimationClip,
  type CharacterAnimationKind,
} from "./character-animation-manifest";

// Lazy GLB clip cache (Phase 4, task 2).
// Clips load on demand per animation and are shared across every character
// instance: 4 characters waving download the wave clip ONCE (in-flight
// requests are deduplicated too). The GLTFLoader itself is dynamically
// imported so it never enters the initial JS bundle. Failures resolve to
// null — callers fall back to procedural/idle (task 9), Home never breaks
// on a missing clip.

// Type-only shape so tests can inject a fake loader.
export type ClipLoader = (url: string) => Promise<AnimationClip | null>;

let loader: ClipLoader | null = null;
const completed = new Map<string, AnimationClip | null>();
const inFlight = new Map<string, Promise<AnimationClip | null>>();

async function defaultLoader(url: string): Promise<AnimationClip | null> {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const [{ GLTFLoader }] = await Promise.all([
      import("three/examples/jsm/loaders/GLTFLoader.js"),
    ]);
    const gltf = await new GLTFLoader().loadAsync(url);
    return (gltf.animations?.[0] as AnimationClip | undefined) ?? null;
  } catch {
    return null;
  }
}

/** Test seam: replace the network loader. */
export function setClipLoaderForTests(next: ClipLoader | null): void {
  loader = next;
}

export function clearClipCache(): void {
  completed.clear();
  inFlight.clear();
}

/** Resolve the clip for a logical animation name, loading lazily. */
export function getAnimationClipData(
  kind: CharacterAnimationKind,
): Promise<AnimationClip | null> {
  const entry = getAnimationClip(kind);
  if (!entry.url) {
    return Promise.resolve(null);
  }
  const cached = completed.get(entry.url);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }
  const pending = inFlight.get(entry.url);
  if (pending) {
    return pending;
  }
  const load = (async () => {
    try {
      return await (loader ?? defaultLoader)(entry.url!);
    } catch {
      // Any failure (404, corrupt GLB, offline) means procedural/idle
      // fallback — Home never breaks on a missing clip (task 9).
      return null;
    }
  })().then((clip) => {
    inFlight.delete(entry.url!);
    completed.set(entry.url!, clip);
    return clip;
  });
  inFlight.set(entry.url, load);
  return load;
}

/** Warm the cache for an animation about to play (fire-and-forget). */
export function preloadAnimationClip(kind: CharacterAnimationKind): void {
  void getAnimationClipData(kind);
}
