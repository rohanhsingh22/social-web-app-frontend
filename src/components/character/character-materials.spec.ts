import { describe, expect, it } from "vitest";
import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { applyCharacterMaterials } from "./character-materials";

function meshWith(
  meshName: string,
  materialName: string,
  color: string,
): Mesh {
  const mesh = new Mesh(
    new SphereGeometry(1),
    new MeshStandardMaterial({ name: materialName, color }),
  );
  mesh.name = meshName;
  return mesh;
}

describe("applyCharacterMaterials", () => {
  it("maps known Wolf3D material names first", () => {
    const root = new Group();
    root.add(
      meshWith("anything", "Wolf3D_Skin", "#ffffff"),
      meshWith("anything", "Wolf3D_Hair", "#ffffff"),
      meshWith("anything", "Wolf3D_Outfit_Top", "#ffffff"),
      meshWith("anything", "Wolf3D_Outfit_Bottom", "#ffffff"),
    );

    applyCharacterMaterials(root, {
      gender: "female",
      skinColor: "#111111",
      hairColor: "#222222",
      outfitColor: "#333333",
    });

    const colors = root.children.map(
      (child) =>
        ((child as Mesh).material as MeshStandardMaterial).color.getHexString(),
    );
    expect(colors).toEqual(["111111", "222222", "333333", "333333"]);
  });

  it("falls back to mesh names and never mutates shared materials", () => {
    const shared = new MeshStandardMaterial({ color: "#ffffff" });
    const mesh = new Mesh(new SphereGeometry(1), shared);
    mesh.name = "Shirt_Mesh";
    const root = new Group();
    root.add(mesh);

    const mystery = meshWith("mystery_part", "MysteryMat", "#abcdef");
    root.add(mystery);

    applyCharacterMaterials(root, {
      gender: "male",
      skinColor: "#111111",
      hairColor: "#222222",
      outfitColor: "#444444",
    });

    // Instance owns its tinted clone; the cached original is untouched.
    expect(mesh.material).not.toBe(shared);
    expect(shared.color.getHexString()).toBe("ffffff");
    expect(
      (mesh.material as MeshStandardMaterial).color.getHexString(),
    ).toBe("444444");
    // Unknown materials pass through.
    expect(
      (mystery.material as MeshStandardMaterial).color.getHexString(),
    ).toBe("abcdef");
  });
});
