import { describe, expect, it } from "vitest";
import { getHomeCharacterLayout } from "./home-character-layout";

describe("getHomeCharacterLayout", () => {
  it("places a solo character center stage", () => {
    const layout = getHomeCharacterLayout(1);

    expect(layout.positions).toEqual([[0, 0, 0]]);
  });

  it("lines up two and three members horizontally", () => {
    expect(getHomeCharacterLayout(2).positions).toHaveLength(2);
    expect(getHomeCharacterLayout(3).positions).toHaveLength(3);

    const [left, middle, right] = getHomeCharacterLayout(3).positions;
    expect(left?.[0]).toBeLessThan(middle?.[0] ?? 0);
    expect(right?.[0]).toBeGreaterThan(middle?.[0] ?? 0);
  });

  it("arranges four members in two rows", () => {
    const layout = getHomeCharacterLayout(4);

    expect(layout.positions).toHaveLength(4);
    const front = layout.positions.filter(([, , z]) => z > 0);
    const back = layout.positions.filter(([, , z]) => z <= 0);
    expect(front).toHaveLength(2);
    expect(back).toHaveLength(2);
  });

  it("clamps out-of-range counts without inventing layouts", () => {
    expect(getHomeCharacterLayout(0).positions).toHaveLength(1);
    expect(getHomeCharacterLayout(99).positions).toHaveLength(4);
  });

  it("keeps compact arrangements tighter than full ones", () => {
    const full = getHomeCharacterLayout(3);
    const compact = getHomeCharacterLayout(3, { compact: true });

    const spread = (positions: number[][]) => {
      const xs = positions.map(([x]) => x ?? 0);
      return Math.max(...xs) - Math.min(...xs);
    };

    expect(spread(compact.positions)).toBeLessThan(spread(full.positions));
  });
});
