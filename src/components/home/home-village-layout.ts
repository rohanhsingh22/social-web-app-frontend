// Village layout (Phase 5, task 2).
// Deterministic, hand-placed composition — NOT procedural generation
// (non-goal). Units are meters in grounded stage space (feet y=0).
// The character stage keeps a clear radius around the origin: no structure
// intersects it, so camera framing stays stable across character models.

export type VillagePropKind =
  | "house"
  | "plaza"
  | "fountain"
  | "bridge"
  | "stream"
  | "path"
  | "tree"
  | "bush"
  | "flowers"
  | "rock"
  | "bench"
  | "lantern";

export type VillageProp = {
  kind: VillagePropKind;
  position: [number, number, number];
  rotationY: number;
  /** Visual variant (roof tint, canopy size, …) — kills copy/paste look. */
  variant: number;
};

/** Nothing but flat ground/paths may enter this radius around the stage. */
export const STAGE_CLEAR_RADIUS = 2.5;

export function getVillageProps(): VillageProp[] {
  return [
    // Social focal area: central plaza + fountain (tasks 4+7).
    { kind: "plaza", position: [0, 0, -6], rotationY: 0, variant: 0 },
    { kind: "fountain", position: [0, 0, -6], rotationY: 0, variant: 0 },
    // Main path: stage -> plaza, plus cross path through the plaza.
    { kind: "path", position: [0, 0, -2.2], rotationY: 0, variant: 0 },
    { kind: "path", position: [0, 0, -6], rotationY: Math.PI / 2, variant: 1 },
    // Architecture: 3 distinct small houses backing the plaza (task 5).
    { kind: "house", position: [-7, 0, -9.5], rotationY: 0.45, variant: 0 },
    { kind: "house", position: [0, 0, -12.5], rotationY: 0, variant: 1 },
    { kind: "house", position: [7, 0, -9.5], rotationY: -0.45, variant: 2 },
    // Stream (west) + bridge crossing to the plaza (task 7).
    { kind: "stream", position: [-5, 0, -5], rotationY: 0, variant: 0 },
    { kind: "bridge", position: [-5, 0, -6], rotationY: Math.PI / 2, variant: 0 },
    // Greenery ring (task 6): trees frame, bushes/flowers edge paths.
    { kind: "tree", position: [-10.5, 0, -2], rotationY: 0.3, variant: 0 },
    { kind: "tree", position: [10.5, 0, -3], rotationY: 2.1, variant: 1 },
    { kind: "tree", position: [-12, 0, -9], rotationY: 1.2, variant: 2 },
    { kind: "tree", position: [12, 0, -10], rotationY: 4.0, variant: 0 },
    { kind: "tree", position: [-5.5, 0, -14], rotationY: 5.1, variant: 1 },
    { kind: "tree", position: [5.5, 0, -14.5], rotationY: 0.8, variant: 2 },
    { kind: "bush", position: [-2.2, 0, -4.6], rotationY: 0, variant: 0 },
    { kind: "bush", position: [2.2, 0, -4.6], rotationY: 0, variant: 1 },
    { kind: "flowers", position: [-4.4, 0, -7.2], rotationY: 0, variant: 0 },
    { kind: "flowers", position: [4.4, 0, -7.2], rotationY: 0, variant: 1 },
    { kind: "rock", position: [-8.5, 0, -5.5], rotationY: 0.7, variant: 0 },
    { kind: "rock", position: [9, 0, -7.5], rotationY: 2.4, variant: 1 },
    // Meeting props: benches face the fountain, lanterns line the path.
    { kind: "bench", position: [-2.6, 0, -5.2], rotationY: 0.5, variant: 0 },
    { kind: "bench", position: [2.6, 0, -5.2], rotationY: -0.5, variant: 0 },
    { kind: "lantern", position: [-1.5, 0, -2.9], rotationY: 0, variant: 0 },
    { kind: "lantern", position: [1.5, 0, -2.9], rotationY: 0, variant: 0 },
    { kind: "lantern", position: [-1.5, 0, -4.2], rotationY: 0, variant: 1 },
    { kind: "lantern", position: [1.5, 0, -4.2], rotationY: 0, variant: 1 },
  ];
}

/** Stage-clearance check used by tests (and future layout edits). */
export function stageClearanceViolations(
  props: VillageProp[] = getVillageProps(),
): VillageProp[] {
  return props.filter((p) => {
    if (p.kind === "path") {
      return false;
    }
    const [x, , z] = p.position;
    return Math.hypot(x, z) < STAGE_CLEAR_RADIUS;
  });
}
