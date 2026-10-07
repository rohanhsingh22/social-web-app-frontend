import type { HomeWorldTheme } from "./home-world-types";

// Permanent default Hirotoli Home world (spec §18): Hirotoli Village v1.
// Cozy social daytime village — warm light, plaza + fountain, houses,
// bridge/stream, greenery, lanterns. Values mirror the backend default so
// server and client resolve the same world. UI light/dark mode NEVER
// changes this theme (spec §19) — it only styles CSS/UI chrome.
// Decoration/asset URLs are allowlisted manifest refs under
// /hirotoli/home/*; final Quaternius GLBs land there after Phase 1 approval
// and the procedural HomeVillageSet below stands in until then.
export const DEFAULT_HIROTOLI_WORLD: HomeWorldTheme = {
  id: "hirotoli-village",
  name: "Hirotoli Village",
  version: 1,
  environment: {
    background: { url: "color:#bfe3f0", kind: "color" },
    sky: { url: "/hirotoli/home/environment/sky-day-soft.glb", kind: "model" },
    ground: {
      url: "/hirotoli/home/environment/ground-village-paths.glb",
      kind: "model",
    },
    environmentModel: {
      url: "/hirotoli/home/environment/village-core-v1.glb",
      kind: "model",
    },
  },
  lighting: {
    ambient: { color: "#fff4e0", intensity: 0.7 },
    directional: {
      color: "#ffe7bd",
      intensity: 1.4,
      position: [4, 8, 5],
    },
    pointLights: [],
  },
  atmosphere: {
    fog: { color: "#cfe8f2", near: 18, far: 60 },
    particles: [
      {
        kind: "pollen-drift",
        count: 40,
        color: "#fff8e1",
        size: 1.5,
        speed: 0.3,
        opacity: 0.45,
      },
    ],
    effects: [{ kind: "contact-shadows", enabled: true }],
  },
  decorations: [
    { url: "/hirotoli/home/environment/house-01.glb", kind: "house" },
    { url: "/hirotoli/home/environment/house-02.glb", kind: "house" },
    { url: "/hirotoli/home/environment/house-03.glb", kind: "house" },
    { url: "/hirotoli/home/environment/plaza-fountain.glb", kind: "plaza" },
    { url: "/hirotoli/home/environment/bridge-stream.glb", kind: "bridge" },
    { url: "/hirotoli/home/props/bench-01.glb", kind: "prop" },
    { url: "/hirotoli/home/props/lantern-01.glb", kind: "prop" },
    { url: "/hirotoli/home/nature/tree-01.glb", kind: "nature" },
    { url: "/hirotoli/home/nature/bush-flower-set-01.glb", kind: "nature" },
  ],
  audio: {
    ambient: { url: "/hirotoli/home/audio/village-day-ambient.mp3", kind: "audio" },
  },
  characterStage: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
  },
  camera: {
    position: [0, 1.6, 5.2],
    target: [0, 1.1, 0],
  },
};
