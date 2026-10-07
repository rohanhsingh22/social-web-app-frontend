import type { CharacterConfig } from "@/types/domain";
import type {
  CharacterDefinition,
  CharacterLoadout,
  ResolvedCharacter,
} from "./character-types";

// Launch catalog: exactly two free characters (spec §5).
// assetIds reuse the shipped GLBs so nothing breaks during migration.
export const CHARACTER_CATALOG: CharacterDefinition[] = [
  {
    id: "character-01",
    name: "Aria",
    assetId: "/character-scene/female.glb",
    rigId: "humanoid-v1",
    defaultLoadoutId: "loadout-character-01-base",
    unlock: { type: "free" },
  },
  {
    id: "character-02",
    name: "Kai",
    assetId: "/character-scene/male.glb",
    rigId: "humanoid-v1",
    defaultLoadoutId: "loadout-character-02-base",
    unlock: { type: "free" },
  },
];

const BY_ID = new Map(CHARACTER_CATALOG.map((c) => [c.id, c]));

export function getCharacterDefinition(id: string): CharacterDefinition | null {
  return BY_ID.get(id) ?? null;
}

function legacyGenderToCharacterId(gender: CharacterConfig["gender"]): string {
  return gender === "male" ? "character-02" : "character-01";
}

function legacyConfigToLoadout(
  characterId: string,
  config: CharacterConfig,
): CharacterLoadout {
  return {
    characterId,
    // Colors ride along untouched — CharacterModel still tints from them.
    // Item ids arrive later as event cosmetics ship.
    skinId: config.skinColor,
    hairId: config.hairColor,
    outfitTopId: config.outfitColor,
    accessoryIds: [],
  } as unknown as CharacterLoadout;
}

/**
 * Resolve any member/profile character payload into a validated
 * definition + loadout. Accepts the new `character` shape or legacy
 * CharacterConfig. Never throws — falls back to character-01 default.
 */
export function resolveCharacter(
  input:
    | { definitionId: string; loadout?: Record<string, unknown> }
    | CharacterConfig
    | null
    | undefined,
): ResolvedCharacter {
  if (!input) {
    return {
      definition: BY_ID.get("character-01")!,
      loadout: { characterId: "character-01", accessoryIds: [] },
    };
  }
  if ("gender" in input) {
    const id = legacyGenderToCharacterId(input.gender);
    return {
      definition: BY_ID.get(id)!,
      loadout: legacyConfigToLoadout(id, input),
    };
  }
  const definition = BY_ID.get(input.definitionId) ?? BY_ID.get("character-01")!;
  const raw = (input.loadout ?? {}) as Record<string, unknown>;
  // Exclusive slots: full outfit wins over top/bottom (mirrors backend).
  const loadout: CharacterLoadout = {
    characterId: definition.id,
    accessoryIds: Array.isArray(raw.accessoryIds)
      ? (raw.accessoryIds as string[])
      : [],
  };
  return { definition, loadout };
}
