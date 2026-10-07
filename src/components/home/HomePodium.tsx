import type { HomeWorldTheme } from "./home-world-types";
import { LOBBY_CLEAR_RADIUS } from "./home-lobby-layout";

// Podium floor (world v2): metallic lobby floor flush at y=-0.02 so
// grounded character feet (y=0) rest on it, glow ring + center emblem
// driven by the app accent color.
export function HomePodium({
  theme,
  accentColor,
}: {
  theme: HomeWorldTheme;
  accentColor: string;
}) {
  // Light twin keeps the same geometry — only the palette changes.
  const light = theme.id.includes("light");
  const floorColor = light ? "#cdd5e4" : "#161829";
  return (
    <group>
      {/* Main floor */}
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[LOBBY_CLEAR_RADIUS, 64]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={light ? 0.7 : 0.45}
          metalness={light ? 0.15 : 0.55}
        />
      </mesh>
      {/* Outer trim ring */}
      <mesh position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[LOBBY_CLEAR_RADIUS - 0.18, LOBBY_CLEAR_RADIUS - 0.02, 64]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
          transparent
          opacity={0.85}
          side={2}
        />
      </mesh>
      {/* Inner stage ring */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.35, 2.5, 64]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
          side={2}
        />
      </mesh>
      {/* Center emblem wash */}
      <mesh position={[0, -0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.3, 64]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.16}
          transparent
          opacity={0.16}
          side={2}
        />
      </mesh>
    </group>
  );
}
