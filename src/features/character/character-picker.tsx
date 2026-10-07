import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { CharacterRenderer } from "@/components/character/CharacterRenderer";
import type { CharacterDefinitionDto } from "@/rtk/character/character-api";

// Character picker: exactly two free launch characters. Selection persists
// via PUT /characters/me — server validates ownership + compatibility.
export function CharacterPicker({
  characters,
  selectedId,
  loadout,
  pendingId,
  onSelect,
}: {
  characters: CharacterDefinitionDto[];
  selectedId: string | null;
  loadout?: Record<string, unknown>;
  pendingId?: string | null;
  onSelect: (characterId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Choose your character">
      {characters.map((c) => {
        const active = selectedId === c.id;
        const pending = pendingId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={pending}
            onClick={() => onSelect(c.id)}
            className={`group overflow-hidden rounded-2xl border text-left transition ${
              active
                ? "border-brand ring-2 ring-brand/30"
                : "border-line hover:border-brand/60"
            }`}
          >
            <div className="h-44 bg-surface-muted">
              <Canvas camera={{ position: [0, 1.4, 4.2], fov: 38 }} dpr={[1, 1.5]}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[3, 5, 4]} intensity={1.4} />
                <Suspense fallback={null}>
                  <CharacterRenderer
                    character={{ definitionId: c.id, loadout }}
                    animate={false}
                  />
                </Suspense>
              </Canvas>
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <div>
                <p className="text-sm font-semibold text-ink">{c.name}</p>
                <p className="text-xs text-ink-subtle">Free · {c.id}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  active ? "bg-brand text-white" : "bg-surface-muted text-ink-subtle"
                }`}
              >
                {pending ? "Saving…" : active ? "Selected" : "Select"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
