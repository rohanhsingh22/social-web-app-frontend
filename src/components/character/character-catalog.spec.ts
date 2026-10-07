import { describe, expect, it } from "vitest";
import { resolveCharacter } from "./character-catalog";

describe("character catalog", () => {
  it("resolves legacy gender configs without breaking", () => {
    expect(resolveCharacter({ gender: "male" }).definition.id).toBe("character-02");
    expect(resolveCharacter({ gender: "female" }).definition.id).toBe("character-01");
  });

  it("falls back to character-01 on unknown input", () => {
    expect(resolveCharacter(null).definition.id).toBe("character-01");
    expect(
      resolveCharacter({ definitionId: "character-99", loadout: {} }).definition.id,
    ).toBe("character-01");
  });

  it("event-readiness: future event cosmetics ride the same shape", () => {
    const resolved = resolveCharacter({
      definitionId: "character-01",
      loadout: { characterId: "character-01", accessoryIds: ["event-pin-01"] },
    });
    expect(resolved.definition.id).toBe("character-01");
    expect(resolved.loadout.accessoryIds).toContain("event-pin-01");
  });
});
