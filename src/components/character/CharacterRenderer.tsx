import { DEFAULT_CHARACTER_CONFIG, type CharacterConfig } from "@/types/domain";
import { CharacterModel } from "./character-model";
import { CharacterEquipment } from "./CharacterEquipment";
import { resolveCharacter } from "./character-catalog";
import type {
  CharacterAnimationKind,
  ResolvedCharacter,
} from "./character-types";
import { useCharacterAnimation } from "./CharacterAnimationController";

// CharacterRenderer (spec §11): load definition + loadout -> base model +
// equipment + materials + animation -> render. Works on Home, previews, and
// any future 3D surface. Accepts legacy CharacterConfig during migration.
export function CharacterRenderer({
  character,
  config,
  position = [0, 0, 0],
  scale = 1,
  opacity = 1,
  animation = "idle",
  animate = true,
}: {
  character?: { definitionId: string; loadout?: Record<string, unknown> } | null;
  config?: CharacterConfig | null;
  position?: [number, number, number];
  scale?: number;
  opacity?: number;
  animation?: CharacterAnimationKind;
  animate?: boolean;
}) {
  const resolved: ResolvedCharacter = resolveCharacter(
    character ?? config ?? DEFAULT_CHARACTER_CONFIG,
  );
  // Legacy tint path: colors still come from the old config until item
  // materials ship. Loadout compatibility was validated server-side.
  const tint: CharacterConfig =
    config ??
    (character?.loadout as unknown as CharacterConfig) ??
    DEFAULT_CHARACTER_CONFIG;
  const animRef = useCharacterAnimation(animate ? animation : "idle", {
    disabled: !animate,
  });

  return (
    <group ref={animRef} position={[0, 0, 0]}>
      <CharacterModel
        key={resolved.definition.id}
        config={{ ...DEFAULT_CHARACTER_CONFIG, ...tint }}
        position={position}
        scale={scale}
        opacity={opacity}
      />
      <group position={position} scale={[scale, scale, scale]}>
        <CharacterEquipment loadout={resolved.loadout} />
      </group>
    </group>
  );
}
