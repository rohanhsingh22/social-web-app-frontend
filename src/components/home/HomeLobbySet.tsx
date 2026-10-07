import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { PointLight } from "three";
import { getLobbyProps } from "./home-lobby-layout";

function Beacon({ position, color, reducedMotion }: {
  position: [number, number, number];
  color: string;
  reducedMotion: boolean;
}) {
  const lightRef = useRef<PointLight>(null);
  const matRef = useRef<{ emissiveIntensity: number }>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) {
      return;
    }
    const pulse = Math.sin(clock.elapsedTime * 2.2) * 0.5 + 0.5;
    if (lightRef.current) {
      lightRef.current.intensity = 0.4 + pulse * 1.2;
    }
    const mat = matRef.current;
    if (mat) {
      mat.emissiveIntensity = 0.6 + pulse * 1.4;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          ref={matRef as never}
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={1}
        distance={6}
        decay={2}
      />
    </group>
  );
}

// Procedural BGMI-lobby set: hangar backdrop, beacon pillars, supply
// crates, floor light strips. All accent-driven; static geometry when
// reduced-motion is on (only the beacon pulse pauses — presence stays).
export function HomeLobbySet({
  accentColor,
  reducedMotion = false,
  light = false,
}: {
  accentColor: string;
  reducedMotion?: boolean;
  light?: boolean;
}) {
  const props = getLobbyProps();
  const wallColor = light ? "#b9c2d8" : "#232842";
  const pillarColor = light ? "#a7b1cb" : "#2e3352";
  const crateColor = light ? "#9fa9c6" : "#333a5e";

  return (
    <group>
      {props.map((prop, i) => {
        if (prop.kind === "wall") {
          return (
            <group
              key={i}
              position={prop.position}
              rotation={[0, prop.rotationY, 0]}
            >
              <mesh receiveShadow castShadow>
                <boxGeometry args={[prop.width, prop.height, 0.3]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} metalness={0.25} />
              </mesh>
              {/* Emissive top edge */}
              <mesh position={[0, prop.height / 2 - 0.06, 0.16]}>
                <boxGeometry args={[prop.width - 0.4, 0.08, 0.04]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={1.1}
                />
              </mesh>
            </group>
          );
        }
        if (prop.kind === "pillar") {
          return (
            <group key={i} position={prop.position}>
              <mesh receiveShadow castShadow position={[0, prop.height / 2, 0]}>
                <boxGeometry args={[0.35, prop.height, 0.35]} />
                <meshStandardMaterial color={pillarColor} roughness={0.6} metalness={0.4} />
              </mesh>
              {/* Vertical accent edge so the pillar reads in the dark */}
              <mesh position={[0, prop.height / 2, 0.19]}>
                <boxGeometry args={[0.08, prop.height - 0.3, 0.03]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={1}
                />
              </mesh>
              {/* Base glow ring */}
              <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.28, 0.4, 24]} />
                <meshBasicMaterial color={accentColor} transparent opacity={0.5} />
              </mesh>
              <Beacon
                position={[0, prop.height + 0.12, 0]}
                color={accentColor}
                reducedMotion={reducedMotion}
              />
            </group>
          );
        }
        if (prop.kind === "crate") {
          return (
            <group key={i} position={prop.position} rotation={[0, prop.rotationY, 0]}>
              <mesh receiveShadow castShadow position={[0, prop.size / 2, 0]}>
                <boxGeometry args={[prop.size, prop.size, prop.size]} />
                <meshStandardMaterial color={crateColor} roughness={0.75} metalness={0.3} />
              </mesh>
              <mesh position={[0, prop.size / 2, prop.size / 2 + 0.01]}>
                <boxGeometry args={[prop.size * 0.7, 0.06, 0.02]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={0.9}
                />
              </mesh>
            </group>
          );
        }
        // strip
        return (
          <mesh
            key={i}
            position={[prop.position[0], 0.005, prop.position[2]]}
            rotation={[-Math.PI / 2, 0, prop.rotationY]}
          >
            <planeGeometry args={[prop.width, 0.12]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.75} />
          </mesh>
        );
      })}
    </group>
  );
}
