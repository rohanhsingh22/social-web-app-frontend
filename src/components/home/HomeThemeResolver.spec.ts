import { describe, expect, it } from "vitest";
import {
  defaultHomeWorld,
  defaultWorldForColorMode,
  isHomeWorldTheme,
  resolveHomeTheme,
  resolveServerTheme,
  selectActiveLayers,
} from "./HomeThemeResolver";
import { DEFAULT_HIROTOLI_WORLD } from "./home-default-theme";

describe("HomeThemeResolver event-readiness", () => {
  it("returns the permanent Hirotoli Village default with no layers", () => {
    expect(resolveHomeTheme([])).toEqual(DEFAULT_HIROTOLI_WORLD);
    expect(resolveHomeTheme([]).id).toBe("hirotoli-village");
  });

  it("never lets UI color mode change the 3D world (spec §19)", () => {
    expect(defaultHomeWorld().id).toBe("hirotoli-village");
    expect(defaultWorldForColorMode("dark").id).toBe("hirotoli-village");
    expect(defaultWorldForColorMode("light").id).toBe("hirotoli-village");
  });

  it("adds an event layer without rewriting HomeWorld", () => {
    const baseCount = DEFAULT_HIROTOLI_WORLD.decorations.length;
    expect(baseCount).toBeGreaterThan(0);
    const theme = resolveHomeTheme([
      {
        id: "event-01",
        priority: 10,
        decorations: [{ url: "event://snow-tree", kind: "prop" }],
      },
    ]);
    expect(theme.decorations).toHaveLength(baseCount + 1);
    expect(DEFAULT_HIROTOLI_WORLD.decorations).toHaveLength(baseCount);
  });

  it("applies overlapping priorities deterministically", () => {
    const theme = resolveHomeTheme([
      { id: "low", priority: 5, environment: { sky: { url: "event://a" } } },
      { id: "high", priority: 10, environment: { sky: { url: "event://b" } } },
    ]);
    expect(theme.environment.sky?.url).toBe("event://b");
  });

  it("filters expired, future and inactive layers by server time (task 16)", () => {
    const now = new Date("2026-10-07T12:00:00.000Z");
    const layers = selectActiveLayers(
      [
        { id: "live", priority: 1 },
        {
          id: "expired",
          priority: 2,
          endsAt: "2026-10-01T00:00:00.000Z",
        },
        {
          id: "future",
          priority: 3,
          startsAt: "2026-11-01T00:00:00.000Z",
        },
        { id: "off", priority: 4, isActive: false },
        { id: "bad-date", priority: 5, startsAt: "not-a-date" },
      ],
      now,
    );
    expect(layers.map((l) => l.id)).toEqual(["live"]);
  });

  it("caps decorations, lights and particles for production safety", () => {
    const theme = resolveHomeTheme([
      {
        id: "noisy",
        priority: 1,
        lighting: {
          pointLights: Array.from({ length: 9 }, () => ({ color: "#fff" })),
        },
        atmosphere: { particles: [{ kind: "snow", count: 9999 }] },
        decorations: Array.from({ length: 100 }, (_, i) => ({
          url: `event://prop-${i}`,
        })),
      },
    ]);
    expect(theme.lighting.pointLights?.length).toBeLessThanOrEqual(4);
    expect(theme.decorations.length).toBeLessThanOrEqual(48);
    expect(theme.atmosphere.particles?.[0]?.count).toBeLessThanOrEqual(220);
  });

  it("prefers the valid server theme, falls back on corrupt payloads", () => {
    const serverTheme = {
      ...JSON.parse(JSON.stringify(DEFAULT_HIROTOLI_WORLD)),
      id: "hirotoli-village",
    };
    expect(
      resolveServerTheme({ theme: serverTheme, activeLayers: [] }).id,
    ).toBe("hirotoli-village");
    // Corrupt server theme -> local resolution -> permanent default.
    expect(resolveServerTheme({ theme: { id: 42 }, activeLayers: [] })).toEqual(
      DEFAULT_HIROTOLI_WORLD,
    );
    expect(resolveServerTheme(null)).toEqual(DEFAULT_HIROTOLI_WORLD);
    expect(isHomeWorldTheme(serverTheme)).toBe(true);
    expect(isHomeWorldTheme({ id: 42 })).toBe(false);
  });
});
