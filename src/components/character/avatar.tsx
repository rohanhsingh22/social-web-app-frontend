import type { CharacterConfig } from "@/types/domain";
import { CharacterModel } from "./character-model";

// 3D character model (R3F). Deliberately NOT named Avatar: the 2D user
// photo lives in components/common/user-avatar.tsx (UserAvatar).
// Thin compatibility wrapper over CharacterModel (Phase 10 refactor).
export function CharacterAvatar({
  config,
  position = [0, 0, 0],
  scale = 1,
}: {
  config: CharacterConfig;
  position?: [number, number, number];
  scale?: number;
}) {
  return <CharacterModel config={config} position={position} scale={scale} />;
}
