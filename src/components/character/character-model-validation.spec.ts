import { describe, expect, it } from "vitest";
import {
  CHARACTER_MODEL_SRC,
  FALLBACK_CHARACTER_ID,
  expectedRigId,
  resolveModelUrl,
} from "./character-assets";
import {
  validateModelScene,
  type ModelSceneSummary,
} from "./character-model-validation";

const goodSummary: ModelSceneSummary = {
  rigId: "humanoid-v1",
  height: 1.8,
  minY: 0,
  boneNames: ["Hips", "Spine", "Head", "Arm"],
  meshCount: 3,
  materialCount: 2,
  meshNames: ["Body", "Head", "Hair"],
};

describe("character model resolution (Phase 2)", () => {
  it("keeps stable IDs with rig metadata", () => {
    expect(Object.keys(CHARACTER_MODEL_SRC)).toEqual([
      "character-01",
      "character-02",
    ]);
    expect(expectedRigId("character-01")).toBe("humanoid-v1");
    expect(expectedRigId("character-02")).toBe("humanoid-v1");
  });

  it("serves compatibility fallbacks until final GLBs land", () => {
    expect(resolveModelUrl("character-01")).toBe("/character-scene/female.glb");
    expect(resolveModelUrl("character-02")).toBe("/character-scene/male.glb");
  });

  it("falls back to character-01 on unknown IDs (never throws)", () => {
    expect(resolveModelUrl("character-99")).toBe(
      resolveModelUrl(FALLBACK_CHARACTER_ID),
    );
  });
});

describe("character model validation gates (Phase 2 tasks 5-10)", () => {
  it("passes a healthy humanoid scene", () => {
    expect(validateModelScene(goodSummary, "humanoid-v1")).toEqual([]);
  });

  it("flags rig mismatch", () => {
    const issues = validateModelScene(
      { ...goodSummary, rigId: "wolf3d-v1" },
      "humanoid-v1",
    );
    expect(issues.map((i) => i.check)).toContain("rig");
  });

  it("flags bad scale and floating feet", () => {
    expect(
      validateModelScene(
        { ...goodSummary, height: 0.4 },
        "humanoid-v1",
      ).map((i) => i.check),
    ).toContain("scale");
    expect(
      validateModelScene({ ...goodSummary, minY: 0.5 }, "humanoid-v1").map(
        (i) => i.check,
      ),
    ).toContain("origin");
  });

  it("flags missing skeleton markers, meshes and materials", () => {
    const issues = validateModelScene(
      {
        ...goodSummary,
        boneNames: ["Hips"],
        meshCount: 0,
        meshNames: [],
        materialCount: 0,
      },
      "humanoid-v1",
    ).map((i) => i.check);
    expect(issues).toContain("skeleton");
    expect(issues).toContain("mesh");
    expect(issues).toContain("material");
  });
});
