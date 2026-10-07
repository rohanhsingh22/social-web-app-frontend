import type { AssetRef } from "./home-world-types";

// Lazy-loaded event/village-overflow props boundary (spec §18: lazy-load
// nonessential decorations and event assets). Decoration refs owned by the
// village geometry set render THERE — this layer only draws event-layer and
// unknown refs as glowing markers so a future event never needs renderer
// changes. Procedural stand-ins keep the contract real: future event GLBs
// resolve through the same AssetRef list.
const VILLAGE_OWNED_KINDS = new Set([
  "house",
  "plaza",
  "bridge",
  "prop",
  "nature",
  "ground",
  "model",
]);

function isVillageOwned(decoration: AssetRef): boolean {
  const url = decoration.url ?? "";
  if (!url.startsWith("/hirotoli/home/")) {
    return false;
  }
  return VILLAGE_OWNED_KINDS.has(decoration.kind ?? "");
}

export function HomeEventProps({ decorations }: { decorations: AssetRef[] }) {
  const markers = decorations.filter((d) => !isVillageOwned(d));
  if (markers.length === 0) {
    return null;
  }
  return (
    <group>
      {markers.map((_, i) => {
        const angle = (i / Math.max(markers.length, 1)) * Math.PI * 2;
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
