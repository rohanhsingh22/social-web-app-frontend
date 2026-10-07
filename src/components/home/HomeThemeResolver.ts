import { DEFAULT_HIROTOLI_WORLD } from "./home-default-theme";
import { LIGHT_HIROTOLI_WORLD } from "./home-light-theme";
import type { HomeThemeLayer, HomeWorldTheme } from "./home-world-types";

export type UiColorMode = "light" | "dark";

// Default world follows the UI color mode: the dark podium-lobby stays
// exactly as-is, light mode gets its palette twin. Same layout, same
// camera — only colors and lighting change. Explicit event/server themes
// always win over this default.
export function defaultWorldForColorMode(mode: UiColorMode): HomeWorldTheme {
  return mode === "light" ? LIGHT_HIROTOLI_WORLD : DEFAULT_HIROTOLI_WORLD;
}

// Resolver: default world + zero or more active event layers = one
// renderable theme (spec §16). When the event ends its layer disappears and
// the default returns automatically. Fail-open: corrupt layers fall back.
export function resolveHomeTheme(
  activeLayers: HomeThemeLayer[] = [],
): HomeWorldTheme {
  if (activeLayers.length === 0) {
    return DEFAULT_HIROTOLI_WORLD;
  }
  const sorted = [...activeLayers].sort((a, b) => a.priority - b.priority);
  const theme: HomeWorldTheme = JSON.parse(
    JSON.stringify(DEFAULT_HIROTOLI_WORLD),
  );
  for (const layer of sorted) {
    if (layer.environment) {
      theme.environment = { ...theme.environment, ...layer.environment };
    }
    if (layer.lighting) {
      theme.lighting = { ...theme.lighting, ...layer.lighting };
    }
    if (layer.atmosphere) {
      theme.atmosphere = { ...theme.atmosphere, ...layer.atmosphere };
    }
    if (layer.decorations) {
      theme.decorations = [...theme.decorations, ...layer.decorations];
    }
    if (layer.audio) {
      theme.audio = layer.audio;
    }
  }
  return theme;
}
