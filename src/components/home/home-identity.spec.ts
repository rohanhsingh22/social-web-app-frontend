import { describe, expect, it } from "vitest";
import { getIdentityCardState } from "./home-identity";
import type { HomeMember } from "@/types/domain";

function member(overrides: Partial<HomeMember> = {}): HomeMember {
  return {
    userId: "user-2",
    publicUserId: "HT-USER2",
    displayName: "Guest",
    role: "PARTICIPANT",
    presence: "online",
    characterConfig: null,
    joinedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("identity card state (spec §22)", () => {
  it("marks self with profile-only actions", () => {
    const state = getIdentityCardState(member({ isSelf: true }));
    expect(state.isSelf).toBe(true);
    expect(state.status).toBe("self");
    expect(state.actions).toEqual(["view-profile"]);
  });

  it("flags the owner independently of connection state", () => {
    expect(
      getIdentityCardState(member({ role: "OWNER" })).isOwner,
    ).toBe(true);
    expect(
      getIdentityCardState(member({ isOwner: true, role: "PARTICIPANT" }))
        .isOwner,
    ).toBe(true);
  });

  it("offers add-connection to strangers", () => {
    const state = getIdentityCardState(member({ connectionStatus: "none" }));
    expect(state.actions).toEqual(["view-profile", "add-connection"]);
  });

  it("offers accept/reject for incoming requests", () => {
    const state = getIdentityCardState(
      member({ connectionStatus: "request_received" }),
    );
    expect(state.actions).toEqual([
      "view-profile",
      "accept-request",
      "reject-request",
    ]);
  });

  it("offers cancel for outgoing requests and stays view-only when connected", () => {
    expect(
      getIdentityCardState(member({ connectionStatus: "request_sent" }))
        .actions,
    ).toEqual(["view-profile", "cancel-request"]);
    expect(
      getIdentityCardState(member({ connectionStatus: "connected" })).actions,
    ).toEqual(["view-profile"]);
  });

  it("degrades unknown statuses to view-only stranger actions", () => {
    const state = getIdentityCardState(
      member({ connectionStatus: "something-new" }),
    );
    expect(state.status).toBe("none");
    expect(state.actions).toEqual(["view-profile", "add-connection"]);
  });
});
