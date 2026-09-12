import { ContactShadows, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { MeshStandardMaterial, PointLight } from "three";
import {
  DEFAULT_CHARACTER_CONFIG,
  type CharacterConfig,
} from "@/types/domain";
import { Avatar } from "./avatar";

function readThemeColor(token: string): string {
  if (typeof document === "undefined") {
    return "";
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
}

/** Re-reads a CSS theme token, refreshing when light/dark or accent changes. */
function useThemeColor(token: string): string {
  const [color, setColor] = useState(() => readThemeColor(token));

  useEffect(() => {
    const refresh = () => setColor(readThemeColor(token));
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-accent"],
    });
    return () => observer.disconnect();
  }, [token]);

  return color;
}

function Pedestal({ accentColor, scale = 1 }: { accentColor: string; scale?: number }) {
  const ringRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.15 + 0.85;
      ringRef.current.emissiveIntensity = pulse;
    }
  });

  return (
    <group position={[0, -0.02, 0]} scale={[scale, 1, scale]}>
      {/* Main platform */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[1.8, 2.0, 0.12, 64]} />
        <meshStandardMaterial
          color="#1a1c2e"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
      {/* Glowing ring on top */}
      <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 64]} />
        <meshStandardMaterial
          ref={ringRef}
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.85}
          transparent
          opacity={0.9}
          side={2}
        />
      </mesh>
      {/* Inner accent glow */}
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 64]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          side={2}
        />
      </mesh>
    </group>
  );
}

function PlatformGlow({ accentColor }: { accentColor: string }) {
  const lightRef = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 1.5) * 0.2 + 1.0;
      lightRef.current.intensity = pulse;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0.5, 0]}
      color={accentColor}
      intensity={1}
      distance={4}
      decay={2}
    />
  );
}

function BackdropGlow({ accentColor }: { accentColor: string }) {
  return (
    <mesh position={[0, 1.6, -3]}>
      <planeGeometry args={[8, 5]} />
      <meshBasicMaterial
        color={accentColor}
        transparent
        opacity={0.06}
        side={2}
      />
    </mesh>
  );
}

export function CharacterScene({
  config,
  configs,
  animate = false,
  interactive = true,
}: {
  config?: CharacterConfig;
  configs?: CharacterConfig[];
  animate?: boolean;
  interactive?: boolean;
}) {
  const characterConfigs = configs ?? [config ?? DEFAULT_CHARACTER_CONFIG];
  const inkSubtleColor = useThemeColor("--ink-subtle");
  const accentColor = useThemeColor("--brand") || "#ff2e63";

  const count = characterConfigs.length;
  const spacing = 7;
  const charScale = 0.8;
  const totalWidth = Math.max((count - 1) * spacing, 6);

  const cameraZ = 5 + totalWidth * 0.5;
  const orbitMin = 4 + totalWidth * 0.4;
  const orbitMax = 8 + totalWidth * 0.6;

  return (
    <div className="showcase-scene relative h-full min-h-[500px] overflow-hidden">
      <Canvas
        className="h-full w-full"
        shadows
        camera={{ position: [0, 1.4, cameraZ], fov: 38 }}
        dpr={[1, 2]}
      >
        <fog attach="fog" args={["#0a0b10", 4 + totalWidth, 12 + totalWidth]} />

        <ambientLight color={inkSubtleColor || "#ffffff"} intensity={0.4} />

        <directionalLight
          position={[4, 8, 5]}
          intensity={1.6}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />

        <directionalLight
          position={[-4, 5, -3]}
          intensity={0.5}
          color="#ffffff"
        />

        <directionalLight
          position={[0, 4, -5]}
          intensity={1.2}
          color={accentColor}
        />

        <PlatformGlow accentColor={accentColor} />
        <BackdropGlow accentColor={accentColor} />

        <Sparkles
          count={60}
          scale={6 + totalWidth}
          size={2}
          speed={0.4}
          opacity={0.5}
          color={accentColor}
        />

        <Pedestal accentColor={accentColor} scale={1.6 + totalWidth * 0.5} />

        <Suspense fallback={null}>
          {characterConfigs.map((cfg, i) => (
            <Avatar
              key={i}
              config={cfg}
              position={[(i * spacing) - totalWidth / 2, 0, 0]}
              scale={charScale}
            />
          ))}
        </Suspense>

        <ContactShadows
          position={[0, 0.01, 0]}
          scale={5 + totalWidth}
          blur={2.5}
          opacity={0.6}
          far={4}
          color="#000000"
        />

        {interactive && (
          <OrbitControls
            autoRotate={animate}
            autoRotateSpeed={0.4}
            enablePan={false}
            enableZoom
            enableRotate
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            minDistance={orbitMin}
            maxDistance={orbitMax}
            target={[0, 1.3, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
