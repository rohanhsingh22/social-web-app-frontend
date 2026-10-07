// Production performance budgets (Phase 8).
// Engineering targets for a 4-character Home on representative hardware
// (desktop 60fps / mobile 30fps+). Measured on-device in UAT (Phase 11);
// the DEV probe warns when a scene exceeds them so regressions surface
// before release. GLB/texture compression (tasks 1-2) runs as a build-time
// step once the final Quaternius binaries land — current 10MB RPM fallbacks
// are bounded by the per-URL cache (each downloads at most once).

export type PerfSnapshot = {
  fps: number;
  draws: number;
  triangles: number;
  geometries: number;
  textures: number;
};

export const HOME_PERF_BUDGETS = {
  /** Minimum acceptable frame rate on representative hardware. */
  minFps: 30,
  /** 4 characters + village set stay well under this in practice. */
  maxDrawCalls: 300,
  /** Two ~10MB RPM GLBs dominate; village procedural stays small. */
  maxTriangles: 800_000,
  maxGeometries: 120,
  maxTextures: 40,
} as const;

export type PerfViolation = {
  metric: keyof PerfSnapshot;
  actual: number;
  budget: number;
};

export function checkPerfBudgets(snapshot: PerfSnapshot): PerfViolation[] {
  const violations: PerfViolation[] = [];
  if (snapshot.fps < HOME_PERF_BUDGETS.minFps) {
    violations.push({
      metric: "fps",
      actual: snapshot.fps,
      budget: HOME_PERF_BUDGETS.minFps,
    });
  }
  if (snapshot.draws > HOME_PERF_BUDGETS.maxDrawCalls) {
    violations.push({
      metric: "draws",
      actual: snapshot.draws,
      budget: HOME_PERF_BUDGETS.maxDrawCalls,
    });
  }
  if (snapshot.triangles > HOME_PERF_BUDGETS.maxTriangles) {
    violations.push({
      metric: "triangles",
      actual: snapshot.triangles,
      budget: HOME_PERF_BUDGETS.maxTriangles,
    });
  }
  if (snapshot.geometries > HOME_PERF_BUDGETS.maxGeometries) {
    violations.push({
      metric: "geometries",
      actual: snapshot.geometries,
      budget: HOME_PERF_BUDGETS.maxGeometries,
    });
  }
  if (snapshot.textures > HOME_PERF_BUDGETS.maxTextures) {
    violations.push({
      metric: "textures",
      actual: snapshot.textures,
      budget: HOME_PERF_BUDGETS.maxTextures,
    });
  }
  return violations;
}
