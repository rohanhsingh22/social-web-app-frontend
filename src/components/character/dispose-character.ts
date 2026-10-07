import type { Material, Mesh, Object3D } from "three";

// Clone disposal (Phase 8, task 10).
// Character instances clone the cached GLB scene and own ONLY their tinted
// materials (flagged hirotoliOwned by tintMaterial). Untinted materials and
// ALL geometries are shared with the drei model cache and must never be
// disposed — doing so would corrupt every sibling instance. Disposing owned
// materials on unmount keeps repeated Home enter/leave cycles from leaking
// GPU programs while the shared cache stays hot (tasks 11-12).

export function disposeOwnedMaterials(root: Object3D): number {
  let disposed = 0;
  root.traverse((node: Object3D) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh || !mesh.material) {
      return;
    }
    const materials: Material[] = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of materials) {
      const userData = (material as unknown as { userData?: unknown })
        .userData as Record<string, unknown> | undefined;
      if (userData?.["hirotoliOwned"] === true) {
        material.dispose();
        disposed += 1;
      }
    }
  });
  return disposed;
}
