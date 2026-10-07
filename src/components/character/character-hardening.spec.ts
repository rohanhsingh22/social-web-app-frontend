import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { describe, expect, it, vi } from "vitest";
import { disposeOwnedMaterials } from "./dispose-character";
import { fallbackModelUrl } from "./character-model-boundary";

function flaggedScene(): { root: Object3D; owned: MeshStandardMaterial; shared: MeshStandardMaterial } {
  const root = new Object3D();
  const owned = new MeshStandardMaterial();
  (owned.userData as Record<string, unknown>)["hirotoliOwned"] = true;
  const ownedSpy = vi.spyOn(owned, "dispose");
  const shared = new MeshStandardMaterial();
  const sharedSpy = vi.spyOn(shared, "dispose");
  const mesh = new Mesh(undefined, owned);
  const mesh2 = new Mesh(undefined, shared);
  root.add(mesh, mesh2);
  void ownedSpy;
  void sharedSpy;
  return { root, owned, shared };
}

describe("clone disposal (Phase 8 task 10)", () => {
  it("disposes owned materials, spares shared cache materials", () => {
    const { root, owned, shared } = flaggedScene();
    const ownedSpy = vi.spyOn(owned, "dispose");
    const sharedSpy = vi.spyOn(shared, "dispose");
    const count = disposeOwnedMaterials(root);
    expect(count).toBe(1);
    expect(ownedSpy).toHaveBeenCalledTimes(1);
    expect(sharedSpy).not.toHaveBeenCalled();
  });

  it("handles empty scenes without throwing", () => {
    expect(disposeOwnedMaterials(new Object3D())).toBe(0);
  });
});

describe("model fallback (Phase 8 task 17)", () => {
  it("resolves the compatibility fallback per stable ID", () => {
    expect(fallbackModelUrl("character-01")).toBe("/character-scene/female.glb");
    expect(fallbackModelUrl("character-02")).toBe("/character-scene/male.glb");
    expect(fallbackModelUrl("character-99")).toBe("/character-scene/female.glb");
  });
});
