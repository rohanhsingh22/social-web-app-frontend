import type {
  CharacterItemCategory,
  CharacterLoadout,
} from "./character-types";
import type { AttachmentPoint } from "./character-equipment-slots";

// Item manifest (Phase 3, tasks 1-2,5).
// Data-driven equipment source: mirrors the backend CharacterItem catalog
// (code catalog + DB rows). Adding a new cosmetic = adding a manifest entry
// (+ backend row) — NO Home or renderer changes (exit criteria).
// Unknown item IDs are never trusted: validateLoadoutItems() drops them with
// a warning and the renderer falls back (task 11).

export type CharacterItemEntry = {
  id: string;
  category: CharacterItemCategory;
  attachment: AttachmentPoint;
  compatibleCharacterIds: string[];
  source: { type: "base" | "event" | "system"; eventId?: string };
};

const LAUNCH_IDS = ["character-01", "character-02"];

function skinned(id: string): CharacterItemEntry {
  return {
    id,
    category: "hair",
    attachment: { type: "skinned" },
    compatibleCharacterIds: [...LAUNCH_IDS],
    source: { type: "base" },
  };
}

export const ITEM_MANIFEST: CharacterItemEntry[] = [
  { ...skinned("skin-base-01") },
  { ...skinned("hair-base-01") },
  {
    id: "outfit-top-base-01",
    category: "outfit_top",
    attachment: { type: "skinned" },
    compatibleCharacterIds: [...LAUNCH_IDS],
    source: { type: "base" },
  },
  {
    id: "outfit-bottom-base-01",
    category: "outfit_bottom",
    attachment: { type: "skinned" },
    compatibleCharacterIds: [...LAUNCH_IDS],
    source: { type: "base" },
  },
  {
    id: "full-outfit-base-01",
    category: "full_outfit",
    attachment: { type: "skinned" },
    compatibleCharacterIds: [...LAUNCH_IDS],
    source: { type: "base" },
  },
  {
    id: "headwear-base-cap-01",
    category: "headwear",
    attachment: { type: "socket", socketName: "headTop" },
    compatibleCharacterIds: [...LAUNCH_IDS],
    source: { type: "base" },
  },
  {
    id: "eyewear-base-glasses-01",
    category: "eyewear",
    attachment: { type: "socket", socketName: "faceFront" },
    compatibleCharacterIds: [...LAUNCH_IDS],
    source: { type: "base" },
  },
];

export const ITEM_MAP = new Map(ITEM_MANIFEST.map((i) => [i.id, i]));

export type LoadoutField = keyof Omit<CharacterLoadout, "characterId" | "accessoryIds">;

// Task 2 — every loadout slot accepts exactly these categories (mirrors the
// backend SLOT_CATEGORY_MAP; the two must stay in sync).
export const SLOT_CATEGORIES: Record<LoadoutField, CharacterItemCategory[]> = {
  skinId: ["hair"],
  hairId: ["hair"],
  outfitTopId: ["outfit_top"],
  outfitBottomId: ["outfit_bottom"],
  fullOutfitId: ["full_outfit"],
  headwearId: ["headwear"],
  eyewearId: ["eyewear"],
  facewearId: ["facewear"],
  footwearId: ["footwear"],
};

const LOADOUT_FIELDS = Object.keys(SLOT_CATEGORIES) as LoadoutField[];

export type LoadoutWarning = {
  field: string;
  itemId: string;
  reason:
    | "unknown-item"
    | "wrong-category"
    | "incompatible-character"
    | "exclusive-slot";
};

/** Task 5 — compatibility matrix lookup. */
export function isItemCompatibleWith(
  itemId: string,
  characterId: string,
): boolean {
  const item = ITEM_MAP.get(itemId);
  return item?.compatibleCharacterIds.includes(characterId) ?? false;
}

/**
 * Tasks 7+11 — validate a raw loadout against the manifest. Never throws:
 * unknown/cross-category/incompatible items are dropped with warnings and
 * the full outfit wins over top/bottom (mirrors backend exclusivity).
 * Ownership is NOT checked here — the server is authoritative (task 9).
 */
export function validateLoadoutItems(
  characterId: string,
  raw: Record<string, unknown>,
): { loadout: CharacterLoadout; warnings: LoadoutWarning[] } {
  const loadout: CharacterLoadout = { characterId, accessoryIds: [] };
  const warnings: LoadoutWarning[] = [];

  for (const field of LOADOUT_FIELDS) {
    const value = raw[field];
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (typeof value !== "string") {
      warnings.push({ field, itemId: String(value), reason: "unknown-item" });
      continue;
    }
    const item = ITEM_MAP.get(value);
    if (!item) {
      warnings.push({ field, itemId: value, reason: "unknown-item" });
      continue;
    }
    if (!SLOT_CATEGORIES[field].includes(item.category)) {
      warnings.push({ field, itemId: value, reason: "wrong-category" });
      continue;
    }
    if (!item.compatibleCharacterIds.includes(characterId)) {
      warnings.push({ field, itemId: value, reason: "incompatible-character" });
      continue;
    }
    loadout[field] = value;
  }

  // Task 10 — full-outfit exclusivity: full outfit wins (mirrors backend).
  if (loadout.fullOutfitId && (loadout.outfitTopId || loadout.outfitBottomId)) {
    for (const field of ["outfitTopId", "outfitBottomId"] as const) {
      if (loadout[field]) {
        warnings.push({
          field,
          itemId: loadout[field]!,
          reason: "exclusive-slot",
        });
        loadout[field] = undefined;
      }
    }
  }

  const accessoryIds = raw.accessoryIds;
  if (Array.isArray(accessoryIds)) {
    const seen = new Set<string>();
    for (const id of accessoryIds) {
      if (typeof id !== "string" || seen.has(id)) {
        continue;
      }
      const item = ITEM_MAP.get(id);
      if (!item || item.category !== "accessory") {
        warnings.push({ field: "accessoryIds", itemId: String(id), reason: "unknown-item" });
        continue;
      }
      if (!item.compatibleCharacterIds.includes(characterId)) {
        warnings.push({
          field: "accessoryIds",
          itemId: id,
          reason: "incompatible-character",
        });
        continue;
      }
      seen.add(id);
    }
    loadout.accessoryIds = [...seen];
  }

  return { loadout, warnings };
}
