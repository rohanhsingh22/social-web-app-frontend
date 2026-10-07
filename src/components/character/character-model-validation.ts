import type { Object3D } from "three";
import { Box3, Vector3 } from "three";

// Phase 2 model verification gates (spec tasks 5-10).
// Pure functions so they run in unit tests without WebGL. The renderer calls
// summarizeModelScene() on the cloned scene in development and warns on
// issues — validation NEVER blocks rendering: a failing model falls back to
// the compatibility GLB via resolveModelUrl(), never to a broken frame.

export type ModelValidationIssue = {
  check:
    | "rig"
    | "scale"
    | "origin"
    | "skeleton"
    | "mesh"
    | "material";
  message: string;
};

export type ModelSceneSummary = {
  rigId: string;
  /** Full height in meters (bounding box). */
  height: number;
  /** Lowest point in meters — feet must rest on y=0. */
  minY: number;
  boneNames: string[];
  meshCount: number;
  materialCount: number;
  meshNames: string[];
};

// Humanoid markers every Hirotoli base model must carry (tasks 5+8).
// Quaternius Humanoid rigs expose these bone names after GLB export.
export const REQUIRED_BONES = ["Hips", "Spine", "Head"] as const;

// Human-scale bounds: stylized adults, feet on ground (tasks 6+7).
export const MIN_HEIGHT_M = 1.2;
export const MAX_HEIGHT_M = 2.2;
export const MAX_GROUND_OFFSET_M = 0.05;

export function validateModelScene(
  summary: ModelSceneSummary,
  expectedRigId: string,
): ModelValidationIssue[] {
  const issues: ModelValidationIssue[] = [];

  // Task 5 — rig compatibility.
  if (summary.rigId !== expectedRigId) {
    issues.push({
      check: "rig",
      message: `rig mismatch: got ${summary.rigId}, expected ${expectedRigId}`,
    });
  }

  // Task 6 — model scale.
  if (
    !Number.isFinite(summary.height) ||
    summary.height < MIN_HEIGHT_M ||
    summary.height > MAX_HEIGHT_M
  ) {
    issues.push({
      check: "scale",
      message: `height ${summary.height}m outside [${MIN_HEIGHT_M}, ${MAX_HEIGHT_M}]m`,
    });
  }

  // Task 7 — origin/pivot (feet on y=0).
  if (
    !Number.isFinite(summary.minY) ||
    Math.abs(summary.minY) > MAX_GROUND_OFFSET_M
  ) {
    issues.push({
      check: "origin",
      message: `feet offset ${summary.minY}m exceeds ±${MAX_GROUND_OFFSET_M}m`,
    });
  }

  // Task 8 — skeleton hierarchy markers.
  const missing = REQUIRED_BONES.filter((b) => !summary.boneNames.includes(b));
  if (missing.length > 0) {
    issues.push({
      check: "skeleton",
      message: `missing bones: ${missing.join(", ")}`,
    });
  }

  // Task 9 — mesh names/metadata present.
  if (summary.meshCount === 0 || summary.meshNames.length === 0) {
    issues.push({
      check: "mesh",
      message: "scene contains no named meshes",
    });
  }

  // Task 10 — material mapping target exists.
  if (summary.materialCount === 0) {
    issues.push({
      check: "material",
      message: "scene contains no materials to isolate",
    });
  }

  return issues;
}

/** Build a summary by traversing a loaded (cloned) scene. */
export function summarizeModelScene(
  root: Object3D,
  rigId: string,
): ModelSceneSummary {
  const boneNames: string[] = [];
  const meshNames: string[] = [];
  const materials = new Set<string>();
  let meshCount = 0;

  root.traverse((child) => {
    const node = child as Object3D & {
      isBone?: boolean;
      isMesh?: boolean;
      isSkinnedMesh?: boolean;
      material?: unknown;
    };
    if (node.isBone) {
      boneNames.push(node.name);
    }
    if (node.isMesh || node.isSkinnedMesh) {
      meshCount += 1;
      if (node.name) {
        meshNames.push(node.name);
      }
      const mat = node.material as
        | { uuid?: string }
        | Array<{ uuid?: string }>
        | undefined;
      if (Array.isArray(mat)) {
        for (const m of mat) {
          if (m?.uuid) {
            materials.add(m.uuid);
          }
        }
      } else if (mat?.uuid) {
        materials.add(mat.uuid);
      }
    }
  });

  // Height/minY come from the already-grounded clone (feet y=0).
  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  const height = size.y;
  const minY = box.min.y;

  return {
    rigId,
    height,
    minY,
    boneNames,
    meshCount,
    materialCount: materials.size,
    meshNames,
  };
}
