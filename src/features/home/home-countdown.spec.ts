import { describe, expect, it } from "vitest";
import {
  HOME_OFFER_TTL_SECONDS,
  remainingSeconds,
} from "./home-countdown";

describe("remainingSeconds", () => {
  it("counts down a 20s offer", () => {
    const expiresAt = new Date(1_000_000 + 20_000).toISOString();

    expect(remainingSeconds(expiresAt, 1_000_000)).toBe(20);
    expect(remainingSeconds(expiresAt, 1_003_000)).toBe(17);
  });

  it("clamps at zero once expired", () => {
    const expiresAt = new Date(1_000_000).toISOString();

    expect(remainingSeconds(expiresAt, 1_000_000)).toBe(0);
    expect(remainingSeconds(expiresAt, 2_000_000)).toBe(0);
  });

  it("falls back to a full countdown on garbage input", () => {
    expect(remainingSeconds("not-a-date", 1_000_000)).toBe(
      HOME_OFFER_TTL_SECONDS,
    );
  });
});
