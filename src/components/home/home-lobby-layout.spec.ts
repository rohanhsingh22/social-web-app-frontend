import { describe, expect, it } from "vitest";
import { LOBBY_CLEAR_RADIUS, getLobbyProps } from "./home-lobby-layout";

describe("lobby layout", () => {
  it("keeps crates and pillars outside the character floor", () => {
    for (const prop of getLobbyProps()) {
      if (prop.kind === "crate" || prop.kind === "pillar") {
        const [x, , z] = prop.position;
        expect(Math.hypot(x, z)).toBeGreaterThan(LOBBY_CLEAR_RADIUS);
      }
    }
  });

  it("is deterministic", () => {
    expect(getLobbyProps()).toEqual(getLobbyProps());
  });
});
