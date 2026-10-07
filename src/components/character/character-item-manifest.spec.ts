import { describe, expect, it } from "vitest";
import {
  ITEM_MAP,
  SLOT_CATEGORIES,
  isItemCompatibleWith,
  validateLoadoutItems,
} from "./character-item-manifest";
import {
  placementForAttachment,
  validateEquipmentSlots,
} from "./character-equipment-slots";

describe("item manifest (Phase 3 tasks 1-2,5)", () => {
  it("uses only known slot categories (no orphans)", () => {
    const allowed = new Set(Object.values(SLOT_CATEGORIES).flat());
    for (const item of ITEM_MAP.values()) {
      expect(allowed.has(item.category)).toBe(true);
    }
    // Launch-equippable slots resolve end to end.
    for (const id of [
      "hair-base-01",
      "outfit-top-base-01",
      "outfit-bottom-base-01",
      "full-outfit-base-01",
      "headwear-base-cap-01",
      "eyewear-base-glasses-01",
    ]) {
      expect(ITEM_MAP.has(id)).toBe(true);
    }
  });

  it("keeps the compatibility matrix on launch characters", () => {
    expect(isItemCompatibleWith("headwear-base-cap-01", "character-01")).toBe(true);
    expect(isItemCompatibleWith("headwear-base-cap-01", "character-99")).toBe(false);
    expect(isItemCompatibleWith("nope", "character-01")).toBe(false);
  });
});

describe("loadout validation (Phase 3 tasks 7,10,11)", () => {
  it("keeps valid items and drops unknown ones with warnings", () => {
    const { loadout, warnings } = validateLoadoutItems("character-01", {
      headwearId: "headwear-base-cap-01",
      hairId: "nope",
      accessoryIds: [],
    });
    expect(loadout.headwearId).toBe("headwear-base-cap-01");
    expect(loadout.hairId).toBeUndefined();
    expect(warnings.map((w) => w.reason)).toContain("unknown-item");
  });

  it("rejects cross-category items per slot", () => {
    const { loadout, warnings } = validateLoadoutItems("character-01", {
      hairId: "outfit-top-base-01",
      accessoryIds: [],
    });
    expect(loadout.hairId).toBeUndefined();
    expect(warnings.map((w) => w.reason)).toContain("wrong-category");
  });

  it("lets the full outfit win over top/bottom", () => {
    const { loadout, warnings } = validateLoadoutItems("character-01", {
      fullOutfitId: "full-outfit-base-01",
      outfitTopId: "outfit-top-base-01",
      accessoryIds: [],
    });
    expect(loadout.fullOutfitId).toBe("full-outfit-base-01");
    expect(loadout.outfitTopId).toBeUndefined();
    expect(warnings.map((w) => w.reason)).toContain("exclusive-slot");
  });

  it("dedupes accessories and drops non-accessory ids", () => {
    const { loadout } = validateLoadoutItems("character-01", {
      accessoryIds: ["headwear-base-cap-01", "not-an-item"],
    });
    expect(loadout.accessoryIds).toEqual([]);
  });
});

describe("attachment strategy (Phase 3 tasks 3-4)", () => {
  it("mounts sockets at offsets, bones at approximations, skinned on body", () => {
    expect(placementForAttachment({ type: "skinned" })).toEqual({ kind: "body" });
    const socket = placementForAttachment({
      type: "socket",
      socketName: "headTop",
    });
    expect(socket.kind).toBe("socket");
    const bone = placementForAttachment({ type: "bone", boneName: "Head" });
    expect(bone.kind).toBe("socket");
  });

  it("keeps the legacy exclusivity helper", () => {
    expect(
      validateEquipmentSlots({ fullOutfit: "a", outfitTop: "b" }),
    ).toBe("EXCLUSIVE_OUTFIT_SLOT");
    expect(validateEquipmentSlots({ outfitTop: "b" })).toBeNull();
  });
});
