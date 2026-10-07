import { Suspense, type ReactNode } from "react";
import { DEFAULT_CHARACTER_CONFIG, type CharacterConfig } from "@/types/domain";
import { CharacterRenderer } from "./CharacterRenderer";

// CharacterStage (spec §11): loading + error + reduced-motion aware frame
// around CharacterRenderer. Same component works solo or in HomeWorld.
export function CharacterStage({
  character,
  config,
  height = 420,
  children,
}: {
  character?: { definitionId: string; loadout?: Record<string, unknown> } | null;
  config?: CharacterConfig | null;
  height?: number;
  children?: ReactNode;
}) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height, minHeight: 260, maxHeight: 560 }}
    >
      <Suspense
        fallback={
          <div
            role="status"
            aria-label="Loading character"
            className="grid h-full place-items-center"
          >
            <div className="h-32 w-24 animate-pulse rounded-2xl bg-surface-muted" />
          </div>
        }
      >
        <CharacterRenderer
          character={character}
          config={config ?? DEFAULT_CHARACTER_CONFIG}
        />
        {children}
      </Suspense>
    </div>
  );
}
