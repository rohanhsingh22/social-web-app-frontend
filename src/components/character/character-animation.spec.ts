import { AnimationClip } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ANIMATION_MANIFEST,
  getAnimationClip,
  resolveAnimationKind,
  setAnimationClipUrlForTests,
} from "./character-animation-manifest";
import {
  clearClipCache,
  getAnimationClipData,
  setClipLoaderForTests,
} from "./character-clip-cache";
import {
  CharacterAnimationLifecycle,
  createLifecycleTestRoot,
} from "./character-animation-lifecycle";

afterEach(() => {
  setAnimationClipUrlForTests("wave", null);
  setAnimationClipUrlForTests("idle", null);
  setClipLoaderForTests(null);
  clearClipCache();
});

describe("animation manifest (Phase 4 tasks 1,3,9)", () => {
  it("ships exactly the 6 launch states", () => {
    expect(ANIMATION_MANIFEST.map((e) => e.kind)).toEqual([
      "idle",
      "wave",
      "happy",
      "sad",
      "celebrate",
      "interaction-ready",
    ]);
  });

  it("falls back to idle on unknown names (never throws)", () => {
    expect(resolveAnimationKind("dance")).toBe("idle");
    expect(resolveAnimationKind(undefined)).toBe("idle");
    expect(resolveAnimationKind("wave")).toBe("wave");
    expect(getAnimationClip("dance" as never).kind).toBe("idle");
  });
});

describe("lazy clip cache (Phase 4 task 2)", () => {
  it("loads lazily, dedupes in-flight, and shares across instances", async () => {
    setAnimationClipUrlForTests("wave", "test://wave.glb");
    const loader = vi.fn(async () => new AnimationClip("wave", -1, []));
    setClipLoaderForTests(loader);
    const [a, b, c, d] = await Promise.all([
      getAnimationClipData("wave"),
      getAnimationClipData("wave"),
      getAnimationClipData("wave"),
      getAnimationClipData("wave"),
    ]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(a).not.toBeNull();
    expect(new Set([a, b, c, d]).size).toBe(1);
  });

  it("falls back to null on load failure (idle takes over)", async () => {
    setAnimationClipUrlForTests("wave", "test://missing.glb");
    setClipLoaderForTests(async () => {
      throw new Error("404");
    });
    await expect(getAnimationClipData("wave")).resolves.toBeNull();
  });

  it("resolves null without loading while clips are unshipped", async () => {
    const loader = vi.fn(async () => new AnimationClip("x", -1, []));
    setClipLoaderForTests(loader);
    await expect(getAnimationClipData("idle")).resolves.toBeNull();
    expect(loader).not.toHaveBeenCalled();
  });
});

describe("clip lifecycle (Phase 4 tasks 4,5,8,9)", () => {
  it("plays one loop at a time and cross-fades on switch", async () => {
    setAnimationClipUrlForTests("wave", "test://wave.glb");
    setAnimationClipUrlForTests("idle", "test://idle.glb");
    setClipLoaderForTests(async (url) => new AnimationClip(url, -1, []));
    const life = new CharacterAnimationLifecycle(createLifecycleTestRoot());
    await expect(life.play("wave")).resolves.toEqual({
      mode: "clip",
      kind: "wave",
    });
    expect(life.isPlayingClip).toBe(true);
    await life.play("idle");
    expect(life.kind).toBe("idle");
    expect(life.isPlayingClip).toBe(true);
    life.stop();
    expect(life.kind).toBeNull();
    life.dispose();
    expect(life.isPlayingClip).toBe(false);
  });

  it("reports procedural mode when the clip is missing", async () => {
    const life = new CharacterAnimationLifecycle(createLifecycleTestRoot());
    await expect(life.play("sad")).resolves.toEqual({
      mode: "procedural",
      kind: "sad",
    });
    life.dispose();
  });

  it("runs 4 simultaneous characters independently on one shared clip", async () => {
    setAnimationClipUrlForTests("wave", "test://wave.glb");
    const loader = vi.fn(async () => new AnimationClip("wave", -1, []));
    setClipLoaderForTests(loader);
    const lives = [
      new CharacterAnimationLifecycle(createLifecycleTestRoot()),
      new CharacterAnimationLifecycle(createLifecycleTestRoot()),
      new CharacterAnimationLifecycle(createLifecycleTestRoot()),
      new CharacterAnimationLifecycle(createLifecycleTestRoot()),
    ];
    await Promise.all(lives.map((life) => life.play("wave")));
    // One network load shared by all four (exit criteria: no 4x download,
    // no frame-rate cliff from duplicated clip parsing).
    expect(loader).toHaveBeenCalledTimes(1);
    expect(lives.every((life) => life.isPlayingClip)).toBe(true);
    // Stopping one leaves the other three playing.
    lives[0]!.stop();
    expect(lives[0]!.isPlayingClip).toBe(false);
    expect(lives.slice(1).every((life) => life.isPlayingClip)).toBe(true);
    for (const life of lives) {
      life.dispose();
    }
  });
});
