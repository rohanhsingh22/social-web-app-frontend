// Predefined Home character layouts (spec #75-76). The renderer never
// invents positions; future arrangements land here without touching 3D code.

export type CharacterPosition = [number, number, number];

export type HomeCharacterLayout = {
  positions: CharacterPosition[];
  scale: number;
};

const FULL_LAYOUTS: Record<number, HomeCharacterLayout> = {
  1: { positions: [[0, 0, 0]], scale: 0.85 },
  2: {
    positions: [
      [-1.9, 0, 0],
      [1.9, 0, 0],
    ],
    scale: 0.8,
  },
  3: {
    positions: [
      [-3.4, 0, 0],
      [0, 0, 0],
      [3.4, 0, 0],
    ],
    scale: 0.8,
  },
  4: {
    positions: [
      [-1.9, 0, 0.9],
      [1.9, 0, 0.9],
      [-1.9, 0, -1.1],
      [1.9, 0, -1.1],
    ],
    scale: 0.75,
  },
};

// Compact 2×2-friendly arrangements for narrow viewports (spec #78).
const COMPACT_LAYOUTS: Record<number, HomeCharacterLayout> = {
  1: { positions: [[0, 0, 0]], scale: 0.8 },
  2: {
    positions: [
      [-1.5, 0, 0],
      [1.5, 0, 0],
    ],
    scale: 0.72,
  },
  3: {
    positions: [
      [-2.6, 0, 0],
      [0, 0, 0],
      [2.6, 0, 0],
    ],
    scale: 0.72,
  },
  4: {
    positions: [
      [-1.5, 0, 0.8],
      [1.5, 0, 0.8],
      [-1.5, 0, -0.9],
      [1.5, 0, -0.9],
    ],
    scale: 0.68,
  },
};

export function getHomeCharacterLayout(
  memberCount: number,
  options?: { compact?: boolean },
): HomeCharacterLayout {
  const layouts = options?.compact ? COMPACT_LAYOUTS : FULL_LAYOUTS;
  const clamped = Math.min(Math.max(Math.round(memberCount) || 1, 1), 4);
  const layout = layouts[clamped];

  return (
    layout ?? { positions: [[0, 0, 0]] as CharacterPosition[], scale: 0.85 }
  );
}
