import type { CharacterConfig } from "@/types/domain";
import type {
  CharacterDefinition,
  CharacterLoadout,
  ResolvedCharacter,
} from "./character-types";
import { validateLoadoutItems } from "./character-item-manifest";

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

// Looks like a catalog item ID (never a raw hex color). Legacy configs store
// colors (skinColor/hairColor/outfitColor) — those stay on the tint path in
// CharacterModel and must NOT leak into the item loadout.
function asItemId(value: unknown): string | undefined {
  if (typeof value !== "string" || value === "") {
    return undefined;
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return undefined;
  }
  return value;
}

function legacyConfigToLoadout(
  characterId: string,
  config: CharacterConfig,
): CharacterLoadout {
  const raw = config as unknown as Record<string, unknown>;
  return {
    characterId,
    skinId: asItemId(raw.skinId),
    hairId: asItemId(raw.hairId),
    outfitTopId: asItemId(raw.outfitTopId),
    outfitBottomId: asItemId(raw.outfitBottomId),
    fullOutfitId: asItemId(raw.fullOutfitId),
    headwearId: asItemId(raw.headwearId),
    eyewearId: asItemId(raw.eyewearId),
    facewearId: asItemId(raw.facewearId),
    footwearId: asItemId(raw.footwearId),
    accessoryIds: Array.isArray(raw.accessoryIds)
      ? (raw.accessoryIds as unknown[]).flatMap((id) => {
          const item = asItemId(id);
          return item ? [item] : [];
        })
      : [],
  };
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
  // Data-driven validation (Phase 3): unknown/cross-category/incompatible
  // items drop with warnings, full outfit wins over top/bottom. Ownership
  // stays server-side — the renderer only decides what is renderable.
  const { loadout, warnings } = validateLoadoutItems(definition.id, {
    ...raw,
    accessoryIds: Array.isArray(raw.accessoryIds)
      ? (raw.accessoryIds as string[])
      : [],
  });
  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn(`[character-catalog] ${definition.id} warnings:`, warnings);
  }
  return { definition, loadout };
}
