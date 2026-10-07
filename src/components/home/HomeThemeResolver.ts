import { DEFAULT_HIROTOLI_WORLD } from "./home-default-theme";
import type { HomeThemeLayer, HomeWorldTheme } from "./home-world-types";

export type UiColorMode = "light" | "dark";

// Backend payload guards mirrored client-side (Phase 8): a bad event layer
// can never blow up the scene, even if it bypasses server validation.
export const MAX_DECORATIONS = 48;
export const MAX_POINT_LIGHTS = 4;
export const MAX_PARTICLES_PER_EMITTER = 220;

// The default Home world is ALWAYS Hirotoli Village (spec §19).
// UI light/dark mode styles CSS/UI chrome only — it never selects, tints,
// or otherwise changes the 3D world. defaultWorldForColorMode survives as a
// deprecated shim so old call sites keep compiling; it ignores its argument.
export function defaultHomeWorld(): HomeWorldTheme {
  return DEFAULT_HIROTOLI_WORLD;
}

/** @deprecated Spec §19: UI color mode must not select the world theme. */
export function defaultWorldForColorMode(_mode: UiColorMode): HomeWorldTheme {
  void _mode;
  return DEFAULT_HIROTOLI_WORLD;
}

// Resolver: default world + zero or more active event layers = one
// renderable theme (spec §16). Priority is deterministic ascending — later
// (higher-priority) layers win conflicts, decorations append (capped).
// When the event ends its layer disappears and the default returns
// automatically. Fail-open: corrupt layers fall back to the default.
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
      const pointLights =
        layer.lighting.pointLights ?? theme.lighting.pointLights ?? [];
      theme.lighting = {
        ...theme.lighting,
        ...layer.lighting,
        pointLights: pointLights.slice(0, MAX_POINT_LIGHTS),
      };
    }
    if (layer.atmosphere) {
      const particles = layer.atmosphere.particles
        ? layer.atmosphere.particles.map((p) => ({
            ...p,
            count: Math.min(p.count ?? 0, MAX_PARTICLES_PER_EMITTER),
          }))
        : theme.atmosphere.particles;
      theme.atmosphere = {
        ...theme.atmosphere,
        ...layer.atmosphere,
        ...(particles ? { particles } : {}),
      };
    }
    if (layer.decorations) {
      theme.decorations = [...theme.decorations, ...layer.decorations].slice(
        0,
        MAX_DECORATIONS,
      );
    }
    if (layer.audio) {
      theme.audio = layer.audio;
    }
  }
  return theme;
}

/**
 * Server-authoritative timing filter (spec §20, task 16).
 * Keeps layers that are active and whose window contains `now`. The backend
 * already filters — this is defense in depth for local/edge layers and for
 * validating server payloads. Invalid dates exclude the layer (fail-closed
 * per layer); an empty result simply resolves to the default (fail-open).
 */
export function selectActiveLayers(
  layers: HomeThemeLayer[] = [],
  now: Date = new Date(),
): HomeThemeLayer[] {
  const t = now.getTime();
  return layers.filter((layer) => {
    if (layer.isActive === false) {
      return false;
    }
    if (layer.startsAt) {
      const start = Date.parse(layer.startsAt);
      if (!Number.isFinite(start) || start > t) {
        return false;
      }
    }
    if (layer.endsAt) {
      const end = Date.parse(layer.endsAt);
      if (!Number.isFinite(end) || end <= t) {
        return false;
      }
    }
    return true;
  });
}

/** Shape guard for server theme payloads — corrupt themes never render. */
export function isHomeWorldTheme(value: unknown): value is HomeWorldTheme {
  if (!value || typeof value !== "object") {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.version === "number" &&
    typeof v.lighting === "object" &&
    v.lighting !== null &&
    typeof v.atmosphere === "object" &&
    v.atmosphere !== null &&
    Array.isArray(v.decorations) &&
    typeof v.characterStage === "object" &&
    v.characterStage !== null &&
    typeof v.camera === "object" &&
    v.camera !== null
  );
}

export type ServerThemePayload = {
  defaultTheme?: unknown;
  activeLayers?: HomeThemeLayer[];
  theme?: unknown;
} | null;

/**
 * Server-authoritative resolution (tasks 10-11).
 * Uses the server-resolved theme whenever its shape validates; otherwise
 * re-resolves from the (time-filtered) active layers locally; otherwise the
 * permanent default. The stage never blocks on the fetch and never renders
 * a corrupt theme — a future event lands by adding a layer, never by
 * rewriting HomeWorld (exit criteria).
 */
export function resolveServerTheme(payload: ServerThemePayload): HomeWorldTheme {
  if (payload && isHomeWorldTheme(payload.theme)) {
    return payload.theme;
  }
  const layers =
    payload && Array.isArray(payload.activeLayers)
      ? selectActiveLayers(payload.activeLayers)
      : [];
  return resolveHomeTheme(layers);
}
