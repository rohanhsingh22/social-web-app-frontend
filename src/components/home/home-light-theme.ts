import type { HomeWorldTheme } from "./home-world-types";

// @deprecated Rollback-only twin of the retired podium-lobby (spec §19:
// UI color mode must not select the 3D world). Kept until hirotoli-village
// passes production validation, then removed. Not referenced by any default
// path — HomeEnvironment renders the lobby solely for the legacy theme id.
export const LIGHT_HIROTOLI_WORLD: HomeWorldTheme = {
  id: "hirotoli-home-default-light",
  name: "Hirotoli Home Light",
  version: 2,
  environment: {
    background: { url: "color:#dfe6f2", kind: "color" },
    ground: { url: "stage-circle", kind: "procedural" },
  },
  lighting: {
    ambient: { color: "#ffffff", intensity: 0.85 },
    directional: {
      color: "#ffffff",
      intensity: 1.8,
      position: [4, 8, 5],
    },
    pointLights: [],
  },
  atmosphere: {
    fog: { color: "#dfe6f2", near: 9, far: 26 },
    particles: [
      {
        kind: "sparkles",
        count: 60,
        color: "accent",
        size: 2,
        speed: 0.4,
        opacity: 0.4,
      },
    ],
    effects: [{ kind: "contact-shadows", enabled: true }],
  },
  decorations: [],
  characterStage: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
  },
  camera: {
    position: [0, 1.5, 5],
    target: [0, 1.2, 0],
  },
};
