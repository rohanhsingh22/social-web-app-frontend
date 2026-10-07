// Procedural Hirotoli Village set (Phase 5).
// Cozy social daytime village from theme-driven primitives: terrain,
// paths, plaza + fountain, houses, bridge/stream, greenery, benches,
// lanterns. Real Quaternius GLBs replace these piece-by-piece later through
// the same decoration refs — layout and theme contract stay unchanged.
// Perf: zero dynamic point lights from props (emissive-only lanterns),
// modest mesh counts, no postprocessing.

import { getVillageProps, type VillageProp } from "./home-village-layout";

const HOUSE_WALLS = ["#e8dcc8", "#dfd3bd", "#e6d5c0"];
const HOUSE_ROOFS = ["#b3543f", "#a34a3a", "#c06a4a"];
const CANOPY = ["#5d9e5f", "#6fae6a", "#548c58"];
const PATH_COLOR = "#d9c49a";
const PLAZA_COLOR = "#cfc3ab";
const WATER_COLOR = "#7cc4de";
const WOOD = "#8a6844";
const WOOD_DARK = "#6e5236";

function House({ prop }: { prop: VillageProp }) {
  const walls = HOUSE_WALLS[prop.variant % HOUSE_WALLS.length]!;
  const roof = HOUSE_ROOFS[prop.variant % HOUSE_ROOFS.length]!;
  return (
    <group position={prop.position} rotation={[0, prop.rotationY, 0]}>
      <mesh receiveShadow castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[3, 2.2, 2.6]} />
        <meshStandardMaterial color={walls} roughness={0.9} />
      </mesh>
      {/* Prism roof */}
      <mesh castShadow position={[0, 2.9, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2.5, 1.4, 4]} />
        <meshStandardMaterial color={roof} roughness={0.85} flatShading />
      </mesh>
      {/* Door + warm windows */}
      <mesh position={[0, 0.7, 1.31]}>
        <boxGeometry args={[0.7, 1.4, 0.06]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 1.3, 1.31]}>
          <boxGeometry args={[0.6, 0.6, 0.06]} />
          <meshStandardMaterial
            color="#ffe9b8"
            emissive="#ffca7a"
            emissiveIntensity={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function PlazaFountain() {
  return (
    <group>
      {/* Plaza disc */}
      <mesh receiveShadow position={[0, 0.02, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 40]} />
        <meshStandardMaterial color={PLAZA_COLOR} roughness={0.95} />
      </mesh>
      {/* Fountain basin + water + spout */}
      <group position={[0, 0, -6]}>
        <mesh receiveShadow castShadow position={[0, 0.35, 0]}>
          <cylinderGeometry args={[1.1, 1.3, 0.7, 24]} />
          <meshStandardMaterial color="#b9b2a2" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 24]} />
          <meshStandardMaterial color={WATER_COLOR} roughness={0.15} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 1.1, 12]} />
          <meshStandardMaterial color="#a8a294" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#c9c3b4" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function Path({ prop }: { prop: VillageProp }) {
  const long = prop.variant === 1;
  return (
    <mesh
      receiveShadow
      position={[prop.position[0], 0.015, prop.position[2]]}
      rotation={[-Math.PI / 2, 0, prop.rotationY]}
    >
      <planeGeometry args={long ? [16, 1.4] : [1.6, 5]} />
      <meshStandardMaterial color={PATH_COLOR} roughness={1} />
    </mesh>
  );
}

function BridgeStream() {
  return (
    <group>
      {/* Stream strip running along z on the west side */}
      <mesh receiveShadow position={[-5, 0.012, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 12]} />
        <meshStandardMaterial color={WATER_COLOR} roughness={0.2} />
      </mesh>
      {/* Arched plank bridge over the stream at plaza height */}
      <group position={[-5, 0, -6]} rotation={[0, Math.PI / 2, 0]}>
        {[-2, -1, 0, 1, 2].map((i) => (
          <mesh
            key={i}
            receiveShadow
            castShadow
            position={[i * 0.55, 0.12 + (2 - Math.abs(i)) * 0.06, 0]}
          >
            <boxGeometry args={[0.5, 0.08, 2.2]} />
            <meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
        ))}
        {[-1.05, 1.05].map((z) => (
          <mesh key={z} castShadow position={[0, 0.65, z]}>
            <boxGeometry args={[2.9, 0.08, 0.08]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Tree({ prop }: { prop: VillageProp }) {
  const canopy = CANOPY[prop.variant % CANOPY.length]!;
  const s = 0.9 + prop.variant * 0.15;
  return (
    <group position={prop.position} rotation={[0, prop.rotationY, 0]} scale={[s, s, s]}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.14, 0.2, 1.8, 8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.2, 0]}>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshStandardMaterial color={canopy} roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0.5, 1.7, 0.3]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color={canopy} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function Bush({ prop }: { prop: VillageProp }) {
  return (
    <group position={prop.position}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial
          color={CANOPY[prop.variant % CANOPY.length]!}
          roughness={0.95}
          flatShading
        />
      </mesh>
    </group>
  );
}

function Flowers({ prop }: { prop: VillageProp }) {
  const petals = prop.variant === 0 ? "#e86a8a" : "#f2c14e";
  return (
    <group position={prop.position}>
      {[-0.25, 0, 0.25].map((x, i) => (
        <group key={i} position={[x, 0, (i % 2) * 0.2 - 0.1]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.24, 6]} />
            <meshStandardMaterial color="#4e7d4a" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color={petals} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Rock({ prop }: { prop: VillageProp }) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={[prop.position[0], 0.25, prop.position[2]]}
      rotation={[0, prop.rotationY, 0]}
    >
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#9aa0a8" roughness={0.95} flatShading />
    </mesh>
  );
}

function Bench({ prop }: { prop: VillageProp }) {
  return (
    <group position={prop.position} rotation={[0, prop.rotationY, 0]}>
      <mesh receiveShadow castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.6, 0.08, 0.45]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.75, -0.22]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.6, 0.4, 0.07]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.08, 0.45, 0.4]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Lantern({ prop }: { prop: VillageProp }) {
  return (
    <group position={prop.position}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 1.8, 8]} />
        <meshStandardMaterial color="#3a3f4a" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Warm lamp: emissive only — no dynamic light (perf, Phase 8). */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial
          color="#ffe6b0"
          emissive="#ffc978"
          emissiveIntensity={1.6}
        />
      </mesh>
      <mesh position={[0, 2.02, 0]}>
        <coneGeometry args={[0.2, 0.14, 8]} />
        <meshStandardMaterial color="#3a3f4a" roughness={0.6} metalness={0.5} />
      </mesh>
    </group>
  );
}

// Village terrain: soft grass disc + distant hill ring. The hills sit inside
// the fog range so the horizon reads as landscape, not void.
function Terrain() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.02, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color="#8cc084" roughness={1} />
      </mesh>
      {[
        { p: [-18, 0, -22] as const, s: 9 },
        { p: [0, 0, -26] as const, s: 11 },
        { p: [18, 0, -22] as const, s: 8 },
      ].map(({ p, s }, i) => (
        <mesh key={i} position={[p[0], 0, p[2]]}>
          <sphereGeometry args={[s, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7ab072" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function HomeVillageSet() {
  const props = getVillageProps();
  return (
    <group>
      <Terrain />
      {props.map((prop, i) => {
        switch (prop.kind) {
          case "house":
            return <House key={i} prop={prop} />;
          case "plaza":
          case "fountain":
            // Rendered once by PlazaFountain (shared center).
            return prop.kind === "plaza" ? <PlazaFountain key={i} /> : null;
          case "path":
            return <Path key={i} prop={prop} />;
          case "bridge":
          case "stream":
            // Rendered once by BridgeStream (shared crossing).
            return prop.kind === "bridge" ? <BridgeStream key={i} /> : null;
          case "tree":
            return <Tree key={i} prop={prop} />;
          case "bush":
            return <Bush key={i} prop={prop} />;
          case "flowers":
            return <Flowers key={i} prop={prop} />;
          case "rock":
            return <Rock key={i} prop={prop} />;
          case "bench":
            return <Bench key={i} prop={prop} />;
          case "lantern":
            return <Lantern key={i} prop={prop} />;
          default:
            return null;
        }
      })}
    </group>
  );
}
