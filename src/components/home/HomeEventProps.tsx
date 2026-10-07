import type { AssetRef } from "./home-world-types";

// Lazy-loaded event props boundary (spec §18: lazy-load nonessential
// decorations and event assets). Procedural stand-ins keep the contract
// real: future event GLBs resolve through the same AssetRef list.
export function HomeEventProps({ decorations }: { decorations: AssetRef[] }) {
  return (
    <group>
      {decorations.map((_, i) => {
        const angle = (i / Math.max(decorations.length, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * 3.4;
        const z = Math.sin(angle) * 3.4;
        return (
          <mesh key={i} position={[x, 0.5, z]}>
            <cylinderGeometry args={[0.12, 0.16, 1, 12]} />
            <meshStandardMaterial
              color="#ff2e63"
              emissive="#ff2e63"
              emissiveIntensity={0.5}
              roughness={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}
