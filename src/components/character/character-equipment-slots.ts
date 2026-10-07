// Attachment/socket abstraction (spec §7). Behavior lives here — never
// scattered through Home components. Phase 1 only needs the slot contract;
// bone/socket mounting arrives with the first real equipment GLBs.

export type AttachmentPoint =
  | { type: "skinned" }
  | { type: "bone"; boneName: string }
  | { type: "socket"; socketName: string };

export type EquipmentSlot =
  | "hair"
  | "outfitTop"
  | "outfitBottom"
  | "fullOutfit"
  | "headwear"
  | "eyewear"
  | "facewear"
  | "footwear"
  | "accessory";

export const EXCLUSIVE_SLOTS: EquipmentSlot[][] = [
  ["fullOutfit", "outfitTop", "outfitBottom"],
];

// Socket approximations for the launch humanoid rig (humanoid-v1).
// Real bone/socket mounting arrives with the first equipment GLBs — these
// positions keep slots visibly working without changing the renderer
// contract. Units match grounded CharacterModel space (feet y=0, head top
// ~1.8 measured from the GLB bounds, face front z~0.2).
export const SOCKET_OFFSETS = {
  headTop: { position: [0, 1.8, 0] as [number, number, number] },
  faceFront: { position: [0, 1.6, 0.17] as [number, number, number] },
} as const;

export function validateEquipmentSlots(
  equipped: Partial<Record<EquipmentSlot, string>>,
): string | null {
  if (
    equipped.fullOutfit &&
    (equipped.outfitTop || equipped.outfitBottom)
  ) {
    return "EXCLUSIVE_OUTFIT_SLOT";
  }
  return null;
}
