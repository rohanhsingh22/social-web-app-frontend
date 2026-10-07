import { describe, expect, it } from "vitest";
import { resolveCharacter } from "./character-catalog";

describe("character catalog", () => {
  it("resolves legacy gender configs without breaking", () => {
    expect(resolveCharacter({ gender: "male" }).definition.id).toBe("character-02");
    expect(resolveCharacter({ gender: "female" }).definition.id).toBe("character-01");
  });

  it("keeps legacy hex colors on the tint path, out of the loadout", () => {
    const resolved = resolveCharacter({
      gender: "female",
      skinColor: "#f5d0a9",
      hairColor: "#2c1a0e",
      outfitColor: "#3b82f6",
    });
    expect(resolved.definition.id).toBe("character-01");
    expect(resolved.loadout.skinId).toBeUndefined();
    expect(resolved.loadout.hairId).toBeUndefined();
    expect(resolved.loadout.outfitTopId).toBeUndefined();
  });

  it("carries real item IDs forward from migrated configs", () => {
    const resolved = resolveCharacter({
      gender: "male",
      headwearId: "headwear-base-cap-01",
      accessoryIds: ["event-pin-01", "#ff0000"],
    } as unknown as Parameters<typeof resolveCharacter>[0]);
    expect(resolved.definition.id).toBe("character-02");
    expect(resolved.loadout.headwearId).toBe("headwear-base-cap-01");
    expect(resolved.loadout.accessoryIds).toEqual(["event-pin-01"]);
  });

  it("falls back to character-01 on unknown input", () => {
    expect(resolveCharacter(null).definition.id).toBe("character-01");
    expect(
      resolveCharacter({ definitionId: "character-99", loadout: {} }).definition.id,
    ).toBe("character-01");
  });

  it("event-readiness: unknown future cosmetics degrade gracefully", () => {
    const resolved = resolveCharacter({
      definitionId: "character-01",
      loadout: { characterId: "character-01", accessoryIds: ["event-pin-01"] },
    });
    // Not in the manifest yet -> dropped, renderer stays working. Shipping
    // the cosmetic is a manifest (+ backend row) addition, nothing else.
    expect(resolved.definition.id).toBe("character-01");
    expect(resolved.loadout.accessoryIds).toEqual([]);
  });
});
