import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Box3, Vector3 } from "three";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  DEFAULT_CHARACTER_CONFIG,
  type CharacterConfig,
} from "@/types/domain";
import { AVATAR_SRC } from "./character-assets";
import {
  applyCharacterMaterials,
  applyInstanceOpacity,
} from "./character-materials";

// Generic character model (spec #113). Knows CharacterConfig and nothing
// else: no HomeMember, Home, voice, owner, or presence. Per-instance cloning
// keeps material state independent across members sharing one GLB.
export function CharacterModel({
  config,
  position = [0, 0, 0],
  scale = 1,
  opacity = 1,
}: {
  config: CharacterConfig;
  position?: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  // useGLTF caches by url: only genders that actually render download.
  const gltf = useGLTF(AVATAR_SRC[config.gender]);

  const scene = useMemo(() => {
    // cloneSkinnedScene: the GLBs are skinned (no clips). A plain clone
    // shares the cached skeleton across instances; proper cloning keeps
    // every character independent today and animatable tomorrow (#115).
    const root = cloneSkinnedScene(gltf.scene);
    const box = new Box3().setFromObject(root);
    const center = box.getCenter(new Vector3());
    // Center horizontally but ground the feet: the GLBs already stand on
    // y=0 (bounds y 0..~1.87), so shifting by -center.y buries half the
    // body below the platform. Resting box.min.y on y=0 keeps every stage
    // (Home, picker, showcase) correct.
    root.position.set(-center.x, -box.min.y, -center.z);
    applyCharacterMaterials(root, {
      ...DEFAULT_CHARACTER_CONFIG,
      ...config,
    });
    applyInstanceOpacity(root, opacity);
    return root;
  }, [gltf, config, opacity]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <primitive object={scene} dispose={null} />
    </group>
  );
}
