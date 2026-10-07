import { describe, expect, it } from "vitest";
import {
  HOME_PERF_BUDGETS,
  checkPerfBudgets,
} from "./home-perf-budgets";
import { getHomeCharacterLayout } from "./home-character-layout";
import { STAGE_CLEAR_RADIUS } from "./home-village-layout";

describe("perf budgets (Phase 8)", () => {
  it("passes a healthy 4-character snapshot, flags breaches", () => {
    expect(
      checkPerfBudgets({
        fps: 60,
        draws: 120,
        triangles: 300_000,
        geometries: 60,
        textures: 20,
      }),
    ).toEqual([]);
    const violations = checkPerfBudgets({
      fps: 20,
      draws: 900,
      triangles: 2_000_000,
      geometries: 400,
      textures: 120,
    });
    expect(violations.map((v) => v.metric)).toEqual([
      "fps",
      "draws",
      "triangles",
      "geometries",
      "textures",
    ]);
    expect(HOME_PERF_BUDGETS.minFps).toBe(30);
  });
});

describe("4-character Home stage (Phase 8 task 18)", () => {
  it("seats four members inside the clear stage zone, both densities", () => {
    for (const compact of [false, true]) {
      const layout = getHomeCharacterLayout(4, { compact });
      expect(layout.positions).toHaveLength(4);
      for (const [x, , z] of layout.positions) {
        // Inside the village stage radius with margin for lanterns/benches.
        expect(Math.hypot(x, z)).toBeLessThanOrEqual(STAGE_CLEAR_RADIUS);
      }
      expect(layout.scale).toBeGreaterThan(0);
    }
  });
});
