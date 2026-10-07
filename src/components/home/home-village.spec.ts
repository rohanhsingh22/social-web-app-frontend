import { describe, expect, it } from "vitest";
import { DEFAULT_HIROTOLI_WORLD } from "./home-default-theme";
import {
  STAGE_CLEAR_RADIUS,
  getVillageProps,
  stageClearanceViolations,
} from "./home-village-layout";

describe("Hirotoli Village v1 (Phase 5)", () => {
  it("is the permanent default world, versioned", () => {
    expect(DEFAULT_HIROTOLI_WORLD.id).toBe("hirotoli-village");
    expect(DEFAULT_HIROTOLI_WORLD.name).toBe("Hirotoli Village");
    expect(DEFAULT_HIROTOLI_WORLD.version).toBe(1);
  });

  it("carries a warm daytime look with stage and camera", () => {
    expect(DEFAULT_HIROTOLI_WORLD.lighting.ambient.color).toBe("#fff4e0");
    expect(DEFAULT_HIROTOLI_WORLD.atmosphere.fog).toMatchObject({
      color: "#cfe8f2",
      near: 18,
      far: 60,
    });
    expect(DEFAULT_HIROTOLI_WORLD.characterStage.position).toEqual([0, 0, 0]);
    expect(DEFAULT_HIROTOLI_WORLD.camera.position).toEqual([0, 1.6, 5.2]);
    expect(DEFAULT_HIROTOLI_WORLD.camera.target).toEqual([0, 1.1, 0]);
  });

  it("ships the village decoration set (houses, plaza, bridge, props, nature)", () => {
    const kinds = DEFAULT_HIROTOLI_WORLD.decorations.map((d) => d.kind);
    expect(kinds).toContain("house");
    expect(kinds).toContain("plaza");
    expect(kinds).toContain("bridge");
    expect(kinds).toContain("prop");
    expect(kinds).toContain("nature");
    expect(
      DEFAULT_HIROTOLI_WORLD.decorations.filter((d) => d.kind === "house"),
    ).toHaveLength(3);
  });

  it("lays out deterministically with a clear character stage", () => {
    const first = getVillageProps();
    const second = getVillageProps();
    expect(second).toEqual(first);
    expect(stageClearanceViolations(first)).toEqual([]);
    expect(STAGE_CLEAR_RADIUS).toBeGreaterThanOrEqual(2.5);
  });

  it("composes houses, plaza, fountain, bridge, greenery and meeting props", () => {
    const kinds = getVillageProps().map((p) => p.kind);
    for (const required of [
      "house",
      "plaza",
      "fountain",
      "bridge",
      "stream",
      "path",
      "tree",
      "bush",
      "flowers",
      "rock",
      "bench",
      "lantern",
    ] as const) {
      expect(kinds).toContain(required);
    }
    expect(kinds.filter((k) => k === "house")).toHaveLength(3);
  });
});
