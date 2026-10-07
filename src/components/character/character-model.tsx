import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Box3, Vector3 } from "three";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  DEFAULT_CHARACTER_CONFIG,
  type CharacterConfig,
} from "@/types/domain";
import {
  AVATAR_SRC,
  expectedRigId,
  resolveModelUrl,
} from "./character-assets";
import {
  summarizeModelScene,
  validateModelScene,
} from "./character-model-validation";
import {
  applyCharacterMaterials,
  applyInstanceOpacity,
} from "./character-materials";
import { disposeOwnedMaterials } from "./dispose-character";

// Generic character model (spec #113). Knows the stable character ID and a
// tint config — nothing else: no HomeMember, Home, voice, owner, presence.
// Identity comes from characterId (Phase 2); gender only survives as the
// legacy fallback path for unmigrated configs. Per-instance cloning keeps
// material state independent across members sharing one GLB.
export function CharacterModel({
  characterId,
  config,
  position = [0, 0, 0],
  scale = 1,
  opacity = 1,
  modelUrlOverride,
}: {
  characterId?: string;
  config: CharacterConfig;
  position?: [number, number, number];
  scale?: number;
  opacity?: number;
  /** Phase 8 fallback retry: forces a specific GLB URL (boundary only). */
  modelUrlOverride?: string;
}) {
  // Stable-ID resolution first; legacy gender mapping only when no ID was
  // resolved upstream (migration fallback, Phase 2 step 12).
  const url =
    modelUrlOverride ??
    (characterId ? resolveModelUrl(characterId) : AVATAR_SRC[config.gender]);
  // useGLTF caches by url: only models that actually render download.
  const gltf = useGLTF(url);

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
    if (import.meta.env.DEV) {
      const issues = validateModelScene(
        summarizeModelScene(
          root,
          expectedRigId(characterId ?? "character-01"),
        ),
        expectedRigId(characterId ?? "character-01"),
      );
      if (issues.length > 0) {
        console.warn(
          `[character-model] ${characterId ?? config.gender} issues:`,
          issues,
        );
      }
    }
    return root;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, config, opacity, characterId, url]);

  // Phase 8: release instance-owned (tinted) materials on unmount so
  // repeated Home enter/leave cycles don't leak GPU programs. Shared
  // geometries and the drei model cache are never touched.
  useEffect(() => {
    return () => {
      disposeOwnedMaterials(scene);
    };
  }, [scene]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <primitive object={scene} dispose={null} />
    </group>
  );
}
