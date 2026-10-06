import { describe, expect, it } from "vitest";
import {
  MAX_VOICE_REJOIN_ATTEMPTS,
  reconnectDelay,
  shouldAutoRejoin,
} from "./voice-reconnect";

describe("reconnectDelay", () => {
  it("backs off exponentially and caps", () => {
    expect(reconnectDelay(1)).toBe(1000);
    expect(reconnectDelay(2)).toBe(2000);
    expect(reconnectDelay(3)).toBe(4000);
    expect(reconnectDelay(10)).toBe(15_000);
    expect(reconnectDelay(100)).toBe(15_000);
  });
});

describe("shouldAutoRejoin", () => {
  const base = {
    autoConnect: true,
    homeId: "home-a",
    connectionState: "disconnected",
    intentional: false,
    attempts: 0,
  };

  it("rejoins unexpected drops while the Home lives", () => {
    expect(shouldAutoRejoin(base)).toBe(true);
  });

  it("stays quiet without a Home, on purpose, or when connected", () => {
    expect(shouldAutoRejoin({ ...base, homeId: null })).toBe(false);
    expect(shouldAutoRejoin({ ...base, intentional: true })).toBe(false);
    expect(
      shouldAutoRejoin({ ...base, connectionState: "connected" }),
    ).toBe(false);
    expect(
      shouldAutoRejoin({ ...base, connectionState: "reconnecting" }),
    ).toBe(false);
    expect(shouldAutoRejoin({ ...base, autoConnect: false })).toBe(false);
  });

  it("gives up after the attempt budget", () => {
    expect(
      shouldAutoRejoin({ ...base, attempts: MAX_VOICE_REJOIN_ATTEMPTS }),
    ).toBe(false);
    expect(
      shouldAutoRejoin({
        ...base,
        attempts: MAX_VOICE_REJOIN_ATTEMPTS - 1,
      }),
    ).toBe(true);
  });
});
