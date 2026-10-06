import { describe, expect, it } from "vitest";
import { getHomeCamera } from "./home-character-camera";

describe("getHomeCamera", () => {
  it("frames every member count", () => {
    for (const count of [1, 2, 3, 4]) {
      const camera = getHomeCamera(count);

      expect(camera.position[2]).toBeGreaterThan(0);
      expect(camera.minDistance).toBeLessThanOrEqual(camera.maxDistance);
    }
  });

  it("pulls back as the cast grows", () => {
    const solo = getHomeCamera(1);
    const full = getHomeCamera(4);

    expect(full.position[2]).toBeGreaterThanOrEqual(solo.position[2]);
  });

  it("uses tighter framing on compact stages", () => {
    const full = getHomeCamera(4);
    const compact = getHomeCamera(4, { compact: true });

    expect(compact.position[2]).toBeLessThanOrEqual(full.position[2]);
  });
});
