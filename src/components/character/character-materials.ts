import type { Material, Mesh, Object3D } from "three";
import {
  DEFAULT_CHARACTER_CONFIG,
  type CharacterConfig,
} from "@/types/domain";

type MaterialSlot = "skin" | "hair" | "outfit";

// Production mapping (spec #73): known material names first, fragile
// mesh-name matching only as fallback. Every tinted material is cloned so
// character instances never share material state (spec #72).
function slotForMaterialName(name: string): MaterialSlot | null {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("wolf3d_skin") ||
    normalized.includes("skin") ||
    normalized.includes("body") ||
    normalized.includes("face")
  ) {
    return "skin";
  }

  if (normalized.includes("wolf3d_hair") || normalized.includes("hair")) {
    return "hair";
  }

  if (
    normalized.includes("wolf3d_outfit") ||
    normalized.includes("outfit") ||
    normalized.includes("cloth") ||
    normalized.includes("shirt") ||
    normalized.includes("top") ||
    normalized.includes("bottom")
  ) {
    return "outfit";
  }

  return null;
}

function slotForMeshName(name: string): MaterialSlot | null {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("skin") ||
    normalized.includes("body") ||
    normalized.includes("face")
  ) {
    return "skin";
  }

  if (normalized.includes("hair")) {
    return "hair";
  }

  if (
    normalized.includes("cloth") ||
    normalized.includes("shirt") ||
    normalized.includes("outfit")
  ) {
    return "outfit";
  }

  return null;
}

function colorForSlot(
  slot: MaterialSlot,
  config: CharacterConfig,
): string | undefined {
  switch (slot) {
    case "skin":
      return config.skinColor ?? DEFAULT_CHARACTER_CONFIG.skinColor;
    case "hair":
      return config.hairColor ?? DEFAULT_CHARACTER_CONFIG.hairColor;
    case "outfit":
      return config.outfitColor ?? DEFAULT_CHARACTER_CONFIG.outfitColor;
  }
}

function hasColor(material: Material): boolean {
  return (
    "color" in material &&
    material.color !== null &&
    typeof material.color === "object" &&
    "set" in (material.color as Record<string, unknown>)
  );
}

function tintMaterial(
  material: Material,
  slot: MaterialSlot | null,
  config: CharacterConfig,
): Material {
  if (!slot || !hasColor(material)) {
    return material;
  }

  const color = colorForSlot(slot, config);
  if (!color) {
    return material;
  }

  const owned = material.clone();
  (
    owned as unknown as {
      color: { set: (color: string) => void };
    }
  ).color.set(color);
  // Ownership flag for disposal (Phase 8): only flagged materials may be
  // disposed on unmount. Unflagged materials are shared with the drei model
  // cache and must survive. Geometries are always shared — never disposed.
  (owned as unknown as { userData: Record<string, unknown> }).userData[
    "hirotoliOwned"
  ] = true;
  return owned;
}

/**
 * Applies a character config to a cloned scene root. Materials are cloned
 * before tinting, so the drei model cache and sibling instances are never
 * mutated. Unknown materials are left untouched (safe fallback).
 */
export function applyCharacterMaterials(
  root: Object3D,
  config: CharacterConfig,
): void {
  root.traverse((node: Object3D) => {
    if (!(node as Mesh).isMesh) {
      return;
    }

    const mesh = node as Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const material = mesh.material;
    if (!material) {
      return;
    }

    if (Array.isArray(material)) {
      mesh.material = material.map((entry) =>
        tintMaterial(
          entry,
          slotForMaterialName(entry.name) ?? slotForMeshName(mesh.name),
          config,
        ),
      );
      return;
    }

    mesh.material = tintMaterial(
      material,
      slotForMaterialName(material.name) ?? slotForMeshName(mesh.name),
      config,
    );
  });
}

/**
 * Applies a uniform opacity to an instance's (already cloned) materials.
 * Used for the offline state; the model cache is unaffected because every
 * material here is instance-owned.
 */
export function applyInstanceOpacity(root: Object3D, opacity: number): void {
  if (opacity >= 1) {
    return;
  }

  root.traverse((node: Object3D) => {
    if (!(node as Mesh).isMesh) {
      return;
    }

    const mesh = node as Mesh;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];

    for (const material of materials) {
      if (
        "transparent" in material &&
        "opacity" in material &&
        typeof material.opacity === "number"
      ) {
        material.transparent = true;
        material.opacity = opacity;
      }
    }
  });
}
