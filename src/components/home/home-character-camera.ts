// Camera framing derived from the member layout (spec #77): the camera
// frames all characters instead of scaling with count × spacing.

export type HomeCamera = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  minDistance: number;
  maxDistance: number;
};

const FULL_CAMERAS: Record<number, HomeCamera> = {
  1: {
    position: [0, 1.5, 5],
    target: [0, 1.2, 0],
    fov: 40,
    minDistance: 3,
    maxDistance: 9,
  },
  2: {
    position: [0, 1.5, 6.5],
    target: [0, 1.2, 0],
    fov: 40,
    minDistance: 4,
    maxDistance: 11,
  },
  3: {
    position: [0, 1.6, 8],
    target: [0, 1.2, 0],
    fov: 40,
    minDistance: 5,
    maxDistance: 13,
  },
  4: {
    position: [0, 1.8, 8.5],
    target: [0, 1.1, 0],
    fov: 42,
    minDistance: 5,
    maxDistance: 13,
  },
};

const COMPACT_CAMERAS: Record<number, HomeCamera> = {
  1: {
    position: [0, 1.5, 4.6],
    target: [0, 1.2, 0],
    fov: 42,
    minDistance: 3,
    maxDistance: 8,
  },
  2: {
    position: [0, 1.5, 5.6],
    target: [0, 1.2, 0],
    fov: 42,
    minDistance: 3.5,
    maxDistance: 9,
  },
  3: {
    position: [0, 1.6, 6.8],
    target: [0, 1.2, 0],
    fov: 42,
    minDistance: 4,
    maxDistance: 11,
  },
  4: {
    position: [0, 1.8, 7.2],
    target: [0, 1.1, 0],
    fov: 44,
    minDistance: 4,
    maxDistance: 11,
  },
};

export function getHomeCamera(
  memberCount: number,
  options?: { compact?: boolean },
): HomeCamera {
  const cameras = options?.compact ? COMPACT_CAMERAS : FULL_CAMERAS;
  const clamped = Math.min(Math.max(Math.round(memberCount) || 1, 1), 4);
  const camera = cameras[clamped];

  return (
    camera ?? {
      position: [0, 1.5, 5] as [number, number, number],
      target: [0, 1.2, 0] as [number, number, number],
      fov: 40,
      minDistance: 3,
      maxDistance: 9,
    }
  );
}
