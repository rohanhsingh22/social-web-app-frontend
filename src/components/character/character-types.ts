// Production character types (hirotoli-character-and-theme.txt §6-8).
// Renderer receives a validated definition + loadout — never the reason it
// was granted. Legacy CharacterConfig stays supported during migration.

export type CharacterUnlock =
  | { type: "free" }
  | { type: "event_coins"; amount: number };

export type CharacterDefinition = {
  id: string;
  name: string;
  assetId: string;
  rigId: string;
  defaultLoadoutId: string;
  unlock: CharacterUnlock;
};

export type CharacterLoadout = {
  characterId: string;
  skinId?: string;
  hairId?: string;
  outfitTopId?: string;
  outfitBottomId?: string;
  fullOutfitId?: string;
  headwearId?: string;
  eyewearId?: string;
  facewearId?: string;
  footwearId?: string;
  accessoryIds: string[];
};

export type CharacterAnimationKind =
  | "idle"
  | "wave"
  | "happy"
  | "sad"
  | "celebrate"
  | "interaction-ready";

export type ResolvedCharacter = {
  definition: CharacterDefinition;
  loadout: CharacterLoadout;
};
