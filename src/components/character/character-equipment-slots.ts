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

export type SocketName = keyof typeof SOCKET_OFFSETS;

// Task 4 — bone fallback map. Until equipment ships with real bone-bound
// GLBs, bone-anchored items mount at the nearest socket approximation so
// they stay visible instead of vanishing. Headwear bones ride the head,
// face bones ride the face, everything else defaults to headTop.
const BONE_TO_SOCKET: Record<string, SocketName> = {
  Head: "headTop",
  Neck: "faceFront",
  Hips: "headTop",
  Spine: "headTop",
};

export type AttachmentPlacement =
  | { kind: "body" }
  | { kind: "socket"; name: SocketName; position: [number, number, number] };

/**
 * Tasks 3+4 — resolve an attachment descriptor to a render placement.
 * skinned → follows the body (no offset). socket → named offset, unknown
 * names fall back to headTop. bone → nearest-socket approximation.
 * Never throws; unknown descriptors follow the body.
 */
export function placementForAttachment(
  attachment: AttachmentPoint,
): AttachmentPlacement {
  if (attachment.type === "skinned") {
    return { kind: "body" };
  }
  if (attachment.type === "socket") {
    const name = (Object.keys(SOCKET_OFFSETS) as SocketName[]).includes(
      attachment.socketName as SocketName,
    )
      ? (attachment.socketName as SocketName)
      : "headTop";
    return { kind: "socket", name, position: SOCKET_OFFSETS[name].position };
  }
  const name = BONE_TO_SOCKET[attachment.boneName] ?? "headTop";
  return { kind: "socket", name, position: SOCKET_OFFSETS[name].position };
}

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
