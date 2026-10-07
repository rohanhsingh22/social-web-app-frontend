import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useMyCharacterQuery,
  useSaveCharacterMutation,
} from "@/rtk/character/character-api";

// Wardrobe: supported equipment slots render from the loadout (spec §7).
// Launch slots with base options: headwear + eyewear. Full outfits stay
// exclusive with top/bottom (server-enforced).
const HEADWEAR_OPTIONS = [
  { id: "", label: "None" },
  { id: "headwear-base-cap-01", label: "Cap" },
];

const EYEWEAR_OPTIONS = [
  { id: "", label: "None" },
  { id: "eyewear-base-glasses-01", label: "Glasses" },
];

export function WardrobePicker() {
  const selection = useMyCharacterQuery();
  const [save, saveState] = useSaveCharacterMutation();
  const [headwear, setHeadwear] = useState<string | null>(null);
  const [eyewear, setEyewear] = useState<string | null>(null);

  const character = selection.data?.character;
  const activeHeadwear =
    headwear ?? (character?.loadout.headwearId as string | undefined) ?? "";
  const activeEyewear =
    eyewear ?? (character?.loadout.eyewearId as string | undefined) ?? "";

  if (selection.isLoading) {
    return <p className="text-sm text-ink-subtle">Loading wardrobe…</p>;
  }

  const saveWardrobe = async () => {
    if (!character) {
      return;
    }
    const loadout: Record<string, unknown> = {
      ...(character.loadout as Record<string, unknown>),
      headwearId: activeHeadwear || undefined,
      eyewearId: activeEyewear || undefined,
    };
    if (!activeHeadwear) {
      delete loadout.headwearId;
    }
    if (!activeEyewear) {
      delete loadout.eyewearId;
    }
    await save({
      characterId: character.definition.id,
      loadout,
    }).unwrap();
    setHeadwear(null);
    setEyewear(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-ink">Headwear</p>
        <div className="mt-2 flex gap-2">
          {HEADWEAR_OPTIONS.map((opt) => (
            <Button
              key={opt.id || "none"}
              variant={activeHeadwear === opt.id ? "default" : "outline"}
              size="sm"
              onClick={() => setHeadwear(opt.id)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">Eyewear</p>
        <div className="mt-2 flex gap-2">
          {EYEWEAR_OPTIONS.map((opt) => (
            <Button
              key={opt.id || "none"}
              variant={activeEyewear === opt.id ? "default" : "outline"}
              size="sm"
              onClick={() => setEyewear(opt.id)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      <Button
        size="sm"
        disabled={saveState.isLoading || !character}
        onClick={() => void saveWardrobe()}
      >
        {saveState.isLoading ? "Saving…" : "Save wardrobe"}
      </Button>
      {saveState.isError && (
        <p className="text-xs text-red-500" role="alert">
          Couldn&apos;t save wardrobe. Event items must be owned first.
        </p>
      )}
    </div>
  );
}
