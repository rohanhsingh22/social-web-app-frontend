import type { HomeWorldTheme } from "./home-world-types";

// Pre-village technical stage (dark podium lobby). Retained ONLY for
// controlled rollback until hirotoli-village passes production validation
// (spec Phase 11, task 16). Never the default — HomeEnvironment renders it
// solely when the active theme id is hirotoli-home-default.
export const LEGACY_HIROTOLI_WORLD: HomeWorldTheme = {
  id: "hirotoli-home-default",
  name: "Hirotoli Home",
  version: 2,
  environment: {
    background: { url: "color:#0a0b10", kind: "color" },
    ground: { url: "stage-circle", kind: "procedural" },
  },
  lighting: {
    ambient: { color: "#ffffff", intensity: 0.5 },
    directional: { color: "#ffffff", intensity: 1.6, position: [4, 8, 5] },
    pointLights: [],
  },
  atmosphere: {
    fog: { color: "#0a0b10", near: 9, far: 26 },
    particles: [
      { kind: "sparkles", count: 60, color: "accent", size: 2, speed: 0.4, opacity: 0.5 },
    ],
    effects: [{ kind: "contact-shadows", enabled: true }],
  },
  decorations: [],
  characterStage: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  camera: { position: [0, 1.5, 5], target: [0, 1.2, 0] },
};
