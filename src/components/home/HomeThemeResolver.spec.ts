import { describe, expect, it } from "vitest";
import { defaultWorldForColorMode, resolveHomeTheme } from "./HomeThemeResolver";
import { DEFAULT_HIROTOLI_WORLD } from "./home-default-theme";
import { LIGHT_HIROTOLI_WORLD } from "./home-light-theme";

describe("HomeThemeResolver event-readiness", () => {
  it("returns the permanent default with no layers", () => {
    expect(resolveHomeTheme([])).toEqual(DEFAULT_HIROTOLI_WORLD);
  });

  it("follows the UI color mode with matching layout", () => {
    const dark = defaultWorldForColorMode("dark");
    const light = defaultWorldForColorMode("light");
    expect(dark).toEqual(DEFAULT_HIROTOLI_WORLD);
    expect(light).toEqual(LIGHT_HIROTOLI_WORLD);
    // Same layout/camera — only palette and lighting differ.
    expect(light.characterStage).toEqual(dark.characterStage);
    expect(light.camera).toEqual(dark.camera);
    expect(light.decorations).toEqual(dark.decorations);
  });

  it("adds an event layer without rewriting HomeWorld", () => {
    const theme = resolveHomeTheme([
      {
        id: "event-01",
        priority: 10,
        decorations: [{ url: "event://snow-tree", kind: "prop" }],
      },
    ]);
    expect(theme.decorations).toHaveLength(1);
    expect(DEFAULT_HIROTOLI_WORLD.decorations).toHaveLength(0);
  });
});
