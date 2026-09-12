"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Box3, MeshStandardMaterial, Vector3 } from "three";
import type { Mesh, Object3D } from "three";
import {
  DEFAULT_CHARACTER_CONFIG,
  type CharacterConfig,
} from "@/types/domain";

const AVATAR_SRC: Record<CharacterConfig["gender"], string> = {
  male: "/character-scene/male.glb",
  female: "/character-scene/female.glb",
};

export function Avatar({
  config,
  position = [0, 0, 0],
  scale = 1,
}: {
  config: CharacterConfig;
  position?: [number, number, number];
  scale?: number;
}) {
  const gltf = useGLTF(AVATAR_SRC[config.gender]);

  const scene = useMemo(() => {
    const root = gltf.scene.clone();
    const box = new Box3().setFromObject(root);
const center = box.getCenter(new Vector3());
    root.position.set(
  -center.x,
  -center.y,
  -center.z,
);
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

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <primitive object={scene} dispose={null} />
    </group>
  );
}
