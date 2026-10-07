import type { ReactNode } from "react";
import type { CharacterLoadout } from "./character-types";
import { ITEM_MAP } from "./character-item-manifest";
import { placementForAttachment } from "./character-equipment-slots";

function Cap() {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.16, 24]} />
        <meshStandardMaterial color="#ff2e63" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.05, 0.22]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.22]} />
        <meshStandardMaterial color="#d92655" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Glasses() {
  return (
    <group>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.03]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

// Launch procedural visuals keyed by item ID. Real equipment GLBs resolve
// through the same slot switch later (placement comes from the manifest
// attachment descriptor) — no Home or renderer changes needed.
const PROCEDURAL: Record<string, () => ReactNode> = {
  "headwear-base-cap-01": Cap,
  "eyewear-base-glasses-01": Glasses,
};

// Equipment layer (spec §7): attachment behavior lives here. Every equipped
// item resolves through the item manifest: unknown IDs render nothing (they
// were already dropped with warnings by validateLoadoutItems), socket/bone
// items mount at their resolved placement, skinned items follow the body.
export function CharacterEquipment({ loadout }: { loadout: CharacterLoadout }) {
  const fields = [
    loadout.skinId,
    loadout.hairId,
    loadout.outfitTopId,
    loadout.outfitBottomId,
    loadout.fullOutfitId,
    loadout.headwearId,
    loadout.eyewearId,
    loadout.facewearId,
    loadout.footwearId,
    ...loadout.accessoryIds,
  ];
  return (
    <group>
      {fields.map((itemId) => {
        if (!itemId) {
          return null;
        }
        const item = ITEM_MAP.get(itemId);
        if (!item) {
          return null;
        }
        const Visual = PROCEDURAL[item.id];
        if (!Visual) {
          return null;
        }
        const placement = placementForAttachment(item.attachment);
        if (placement.kind === "body") {
          return <Visual key={item.id} />;
        }
        return (
          <group key={item.id} position={placement.position}>
            <Visual />
          </group>
        );
      })}
    </group>
  );
}
