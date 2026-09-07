"use client";

import { ContactShadows, OrbitControls, Sparkles, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Box3,
  MeshStandardMaterial,
  PointLight,
  Vector3,
} from "three";
import type { Mesh, Object3D } from "three";
import {
  DEFAULT_CHARACTER_CONFIG,
  type CharacterConfig,
} from "@/types/domain";

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

const AVATAR_SRC: Record<CharacterConfig["gender"], string> = {
  male: "/character-scene/male.glb",
  female: "/character-scene/female.glb",
};

function Avatar({ config }: { config: CharacterConfig }) {
  const gltf = useGLTF(AVATAR_SRC[config.gender]);

  const scene = useMemo(() => {
    const root = gltf.scene.clone();
    const box = new Box3().setFromObject(root);
    const center = box.getCenter(new Vector3());
    root.position.set(-center.x, -box.min.y, -center.z);
    root.traverse((node: Object3D) => {
      if ((node as Mesh).isMesh) {
        const mesh = node as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const material = (mesh as Mesh).material as MeshStandardMaterial | undefined;
        if (material) {
          const name = mesh.name.toLowerCase();
          if (name.includes("skin") || name.includes("body") || name.includes("face")) {
            material.color.set(config.skinColor ?? DEFAULT_CHARACTER_CONFIG.skinColor ?? "#f5d0a9");
          } else if (name.includes("hair")) {
            material.color.set(config.hairColor ?? DEFAULT_CHARACTER_CONFIG.hairColor ?? "#2c1a0e");
          } else if (name.includes("cloth") || name.includes("shirt") || name.includes("outfit")) {
            material.color.set(config.outfitColor ?? DEFAULT_CHARACTER_CONFIG.outfitColor ?? "#3b82f6");
          }
        }
      }
    });
    return root;
  }, [gltf, config.skinColor, config.hairColor, config.outfitColor]);

  return <primitive object={scene} dispose={null} />;
}

function Pedestal({ accentColor }: { accentColor: string }) {
  const ringRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.15 + 0.85;
      ringRef.current.emissiveIntensity = pulse;
    }
  });

  return (
    <group position={[0, -0.02, 0]}>
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
  animate = false,
  interactive = true,
}: {
  config?: CharacterConfig;
  animate?: boolean;
  interactive?: boolean;
}) {
  const resolvedConfig = config ?? DEFAULT_CHARACTER_CONFIG;
  const inkSubtleColor = useThemeColor("--ink-subtle");
  const accentColor = useThemeColor("--brand") || "#ff2e63";

  return (
    <div className="showcase-scene relative h-full min-h-[500px] overflow-hidden">
      <Canvas
        className="h-full w-full"
        shadows
        camera={{ position: [0, 1.4, 3.5], fov: 38 }}
        dpr={[1, 2]}
      >
        {/* Fog for depth */}
        <fog attach="fog" args={["#0a0b10", 4, 12]} />

        {/* Ambient fill */}
        <ambientLight color={inkSubtleColor || "#ffffff"} intensity={0.4} />

        {/* Key light — main directional */}
        <directionalLight
          position={[4, 8, 5]}
          intensity={1.6}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />

        {/* Fill light — softer from opposite side */}
        <directionalLight
          position={[-4, 5, -3]}
          intensity={0.5}
          color="#ffffff"
        />

        {/* Rim light — accent colored back light for hero look */}
        <directionalLight
          position={[0, 4, -5]}
          intensity={1.2}
          color={accentColor}
        />

        {/* Platform glow light */}
        <PlatformGlow accentColor={accentColor} />

        {/* Backdrop glow */}
        <BackdropGlow accentColor={accentColor} />

        {/* Floating particles */}
        <Sparkles
          count={60}
          scale={6}
          size={2}
          speed={0.4}
          opacity={0.5}
          color={accentColor}
        />

        {/* Pedestal */}
        <Pedestal accentColor={accentColor} />

        {/* Character */}
        <Suspense fallback={null}>
          <Avatar config={resolvedConfig} />
        </Suspense>

        {/* Contact shadows under character */}
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={5}
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
            minDistance={2.2}
            maxDistance={4.8}
            target={[0, 1.3, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
