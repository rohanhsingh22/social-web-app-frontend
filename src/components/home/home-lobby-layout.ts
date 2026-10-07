// Deterministic lobby-set layout (podium-lobby world v2).
// Pure data: prop placement derives from counts/seed only, so the 3D set
// stays theme-driven and unit-testable without a WebGL renderer.

export type LobbyProp =
  | { kind: "pillar"; position: [number, number, number]; height: number }
  | { kind: "crate"; position: [number, number, number]; size: number; rotationY: number }
  | { kind: "wall"; position: [number, number, number]; width: number; height: number; rotationY: number }
  | { kind: "strip"; position: [number, number, number]; width: number; rotationY: number };

// Character floor keeps a clear disc (radius 4.2 covers the widest
// 4-member layout at ±3.4 + body margin). Props live outside it or form
// the far backdrop so gameplay space is never cluttered.
export const LOBBY_CLEAR_RADIUS = 4.2;

export function getLobbyProps(): LobbyProp[] {
  return [
    // Far hangar backdrop (behind the stage, outside orbit range).
    { kind: "wall", position: [0, 1.5, -6.5], width: 14, height: 3, rotationY: 0 },
    { kind: "wall", position: [-6.5, 1.25, -3], width: 8, height: 2.5, rotationY: Math.PI / 3 },
    { kind: "wall", position: [6.5, 1.25, -3], width: 8, height: 2.5, rotationY: -Math.PI / 3 },
    // Side pillars with beacon strips.
    { kind: "pillar", position: [-4.6, 0, -2.5], height: 3.2 },
    { kind: "pillar", position: [4.6, 0, -2.5], height: 3.2 },
    { kind: "pillar", position: [-5.2, 0, 2.2], height: 2.6 },
    { kind: "pillar", position: [5.2, 0, 2.2], height: 2.6 },
    // Supply crates flanking the floor (outside the clear disc).
    { kind: "crate", position: [-4.9, 0, 0.4], size: 0.7, rotationY: 0.4 },
    { kind: "crate", position: [-5.5, 0, 1.3], size: 0.5, rotationY: -0.3 },
    { kind: "crate", position: [4.9, 0, 0.4], size: 0.7, rotationY: -0.4 },
    { kind: "crate", position: [5.5, 0, 1.3], size: 0.5, rotationY: 0.35 },
    { kind: "crate", position: [0, 0, -5.6], size: 0.9, rotationY: 0.1 },
    // Floor light strips ringing the platform.
    { kind: "strip", position: [0, 0, 3.1], width: 2.2, rotationY: 0 },
    { kind: "strip", position: [-2.9, 0, -1.2], width: 1.6, rotationY: Math.PI / 3 },
    { kind: "strip", position: [2.9, 0, -1.2], width: 1.6, rotationY: -Math.PI / 3 },
  ];
}
