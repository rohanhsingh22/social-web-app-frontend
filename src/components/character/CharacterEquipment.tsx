import type { CharacterLoadout } from "./character-types";
import { SOCKET_OFFSETS } from "./character-equipment-slots";

function Cap() {
  return (
    <group position={SOCKET_OFFSETS.headTop.position}>
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
    <group position={SOCKET_OFFSETS.faceFront.position}>
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

// Equipment layer (spec §7): attachment behavior lives here. Item ids that
// ship real GLBs later resolve through the same slot switch — no Home or
// renderer changes needed.
export function CharacterEquipment({ loadout }: { loadout: CharacterLoadout }) {
  return (
    <group>
      {loadout.headwearId === "headwear-base-cap-01" && <Cap />}
      {loadout.eyewearId === "eyewear-base-glasses-01" && <Glasses />}
    </group>
  );
}
