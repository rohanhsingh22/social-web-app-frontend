import { describe, expect, it } from "vitest";
import {
  normalizeAuthSession,
  normalizeChannelMessagePage,
  normalizeHomeConnection,
  normalizeHomeConnections,
  normalizeHomeInvitation,
  normalizeHomeJoinRequest,
  normalizeHomeMember,
  normalizeHomeState,
  normalizeHomeVoiceToken,
  normalizeProfilePicture,
  normalizeSearchUsers,
  normalizeThoughtPage,
  normalizeToliRef,
} from "./normalizers";
import { resolveToliAvatarImage } from "./toli-avatar";

describe("normalizeThoughtPage", () => {
  it("carries the For You deferred ids through the envelope", () => {
    const page = normalizeThoughtPage({
      data: {
        thoughts: [],
        pageInfo: { hasMore: true, nextCursor: "cursor-1" },
        deferred: ["t1", "t2"],
      },
    });

    expect(page.deferred).toEqual(["t1", "t2"]);
  });

  it("defaults deferred to empty and drops non-strings", () => {
    const page = normalizeThoughtPage({
      data: {
        thoughts: [],
        pageInfo: { hasMore: false, nextCursor: null },
        deferred: ["t1", 42, null],
      },
    });

    expect(page.deferred).toEqual(["t1"]);

    const bare = normalizeThoughtPage({
      data: { thoughts: [], pageInfo: { hasMore: false, nextCursor: null } },
    });

    expect(bare.deferred).toEqual([]);
  });
});

describe("normalizeChannelMessagePage", () => {
  it("preserves pageInfo through the response envelope", () => {
    const page = normalizeChannelMessagePage({
      data: {
        messages: [{ id: "m1", body: "hi" }],
        pageInfo: { hasMore: true, nextCursor: "2026-01-01T00:00:00.000Z" },
      },
    });

    expect(page.messages).toHaveLength(1);
    expect(page.pageInfo).toEqual({
      hasMore: true,
      nextCursor: "2026-01-01T00:00:00.000Z",
    });
  });

  it("handles raw pages without an envelope", () => {
    const page = normalizeChannelMessagePage({
      messages: [],
      pageInfo: { hasMore: false, nextCursor: null },
    });

    expect(page.pageInfo).toEqual({ hasMore: false, nextCursor: null });
  });
});

describe("normalizeProfilePicture", () => {
  it("honors scalar session columns for Toli users", () => {
    expect(
      normalizeProfilePicture({
        avatarUrl: "https://photo.png",
        profilePictureType: "toli",
        toliAvatarKey: "vector_01",
      }),
    ).toEqual({
      type: "toli",
      avatarUrl: "https://photo.png",
      toliAvatarKey: "vector_01",
    });
  });

  it("defaults to provider without picture info", () => {
    expect(normalizeProfilePicture({ username: "x" })).toEqual({
      type: "provider",
      avatarUrl: null,
      toliAvatarKey: null,
    });
  });
});

describe("normalizeToliRef", () => {
  it("requires both id and name", () => {
    expect(normalizeToliRef({ id: "t1", name: "Vector" })).toEqual({
      id: "t1",
      name: "Vector",
    });
    expect(normalizeToliRef({ id: "t1" })).toBeNull();
    expect(normalizeToliRef("vector")).toBeNull();
  });
});

describe("normalizeAuthSession", () => {
  it("reads the nested session profile with Toli", () => {
    const session = normalizeAuthSession({
      data: {
        user: {
          id: "u1",
          profile: {
            username: "amy",
            displayName: "Amy",
            toliId: "t1",
            toli: { id: "t1", name: "Vector" },
          },
        },
      },
    });

    expect(session.profile?.toli).toEqual({ id: "t1", name: "Vector" });
    expect(session.profile?.toliId).toBe("t1");
  });
});

describe("normalizeSearchUsers", () => {
  it("keeps connection status, direction, and dates", () => {
    const result = normalizeSearchUsers({
      data: {
        users: [
          {
            id: "HT-7K4M9Q2X",
            profile: { username: "amy", displayName: "Amy" },
            connection: {
              id: "c1",
              status: "accepted",
              direction: null,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-02-01T00:00:00.000Z",
            },
          },
        ],
      },
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0]?.connection).toEqual({
      id: "c1",
      status: "accepted",
      direction: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });
  });
});

describe("resolveToliAvatarImage", () => {
  it("resolves every catalog key to a bundled asset", () => {
    const tolis = ["vector", "wave", "quantum", "orbit", "flux"];
    for (const toli of tolis) {
      for (let n = 1; n <= 5; n += 1) {
        const key = `${toli}_${String(n).padStart(2, "0")}`;
        expect(resolveToliAvatarImage(key)).toMatch(/\.webp$/);
      }
    }
  });

  it("returns null for unknown keys", () => {
    expect(resolveToliAvatarImage("nope_99")).toBeNull();
    expect(resolveToliAvatarImage(null)).toBeNull();
  });
});

describe("normalizeHomeState", () => {
  it("returns null when the user has no shared Home", () => {
    expect(normalizeHomeState({ data: { home: null } })).toBeNull();
    expect(normalizeHomeState({ data: {} })).toBeNull();
    expect(normalizeHomeState(null)).toBeNull();
  });

  it("normalizes members with presence and character config", () => {
    const state = normalizeHomeState({
      data: {
        home: {
          id: "home-a",
          ownerId: "owner-1",
          memberCount: 2,
          members: [
            {
              userId: "owner-1",
              publicUserId: "HT-OWNER001",
              displayName: "Owner",
              role: "OWNER",
              presence: "online",
              characterConfig: { gender: "female" },
              joinedAt: "2026-10-05T00:00:00.000Z",
            },
            {
              userId: "user-2",
              displayName: "Guest",
              role: "BOSS",
              presence: "away",
            },
          ],
        },
      },
    });

    expect(state?.memberCount).toBe(2);
    expect(state?.members[0]).toEqual(
      expect.objectContaining({
        userId: "owner-1",
        role: "OWNER",
        presence: "online",
        characterConfig: expect.objectContaining({ gender: "female" }),
      }),
    );
    // Unknown role/presence fall back; missing character stays null.
    expect(state?.members[1]).toEqual(
      expect.objectContaining({
        role: "PARTICIPANT",
        presence: "offline",
        characterConfig: null,
      }),
    );
  });
});

describe("normalizeHomeConnections", () => {
  it("classifies AVAILABLE, MY_HOME, and OTHER_HOME", () => {
    const connections = normalizeHomeConnections({
      data: {
        connections: [
          { userId: "free-1", displayName: "Free", homeState: "AVAILABLE" },
          { userId: "mate-1", displayName: "Mate", homeState: "MY_HOME" },
          {
            userId: "busy-1",
            displayName: "Busy",
            homeState: "OTHER_HOME",
            homeMemberCount: 3,
          },
          { userId: "weird-1", homeState: "SOMEWHERE" },
        ],
      },
    });

    expect(connections.map((c) => c.homeState)).toEqual([
      "AVAILABLE",
      "MY_HOME",
      "OTHER_HOME",
      "AVAILABLE",
    ]);
    expect(connections[2]?.homeMemberCount).toBe(3);
    expect(connections[0]?.homeMemberCount).toBeNull();
  });
});

describe("normalizeHomeInvitation", () => {
  it("unwraps the invitation envelope", () => {
    const invitation = normalizeHomeInvitation({
      data: {
        invitation: {
          id: "invite-1",
          homeId: "home-a",
          inviterId: "user-1",
          inviteeId: "user-2",
          status: "PENDING",
          expiresAt: "2026-10-05T00:00:20.000Z",
        },
      },
    });

    expect(invitation).toEqual(
      expect.objectContaining({ id: "invite-1", status: "PENDING" }),
    );
  });
});

describe("normalizeHomeJoinRequest", () => {
  it("unwraps the join-request envelope", () => {
    const request = normalizeHomeJoinRequest({
      data: {
        joinRequest: {
          id: "request-1",
          homeId: "home-b",
          requesterId: "user-3",
          targetMemberId: "user-4",
          status: "PENDING",
          expiresAt: "2026-10-05T00:00:20.000Z",
        },
      },
    });

    expect(request).toEqual(
      expect.objectContaining({
        id: "request-1",
        targetMemberId: "user-4",
      }),
    );
  });
});

describe("normalizeHomeVoiceToken", () => {
  it("keeps token, server URL, and expiry", () => {
    expect(
      normalizeHomeVoiceToken({
        data: {
          token: "jwt",
          serverUrl: "wss://livekit.example",
          expiresAt: "2026-10-05T01:00:00.000Z",
        },
      }),
    ).toEqual({
      token: "jwt",
      serverUrl: "wss://livekit.example",
      expiresAt: "2026-10-05T01:00:00.000Z",
    });
  });
});

describe("normalizeHomeConnection", () => {
  it("defaults unknown states to AVAILABLE", () => {
    expect(normalizeHomeConnection({ userId: "u1" }).homeState).toBe(
      "AVAILABLE",
    );
  });

  it("carries the authoritative connection status for the identity card", () => {
    expect(
      normalizeHomeConnection({ userId: "u1", connectionStatus: "connected" })
        .connectionStatus,
    ).toBe("connected");
    expect(
      normalizeHomeConnection({ userId: "u1" }).connectionStatus,
    ).toBeUndefined();
  });
});

describe("normalizeHomeMember identity signals", () => {
  it("carries isOwner/isSelf/connectionStatus through (camel + snake)", () => {
    expect(
      normalizeHomeMember({
        userId: "u1",
        isOwner: true,
        isSelf: false,
        connectionStatus: "connected",
      }),
    ).toEqual(
      expect.objectContaining({
        isOwner: true,
        isSelf: false,
        connectionStatus: "connected",
      }),
    );
    expect(
      normalizeHomeMember({
        userId: "u1",
        is_owner: true,
        is_self: true,
        connection_status: "request_received",
      }),
    ).toEqual(
      expect.objectContaining({
        isOwner: true,
        isSelf: true,
        connectionStatus: "request_received",
      }),
    );
  });

  it("leaves signals absent on legacy payloads (card falls back)", () => {
    expect(normalizeHomeMember({ userId: "u1" }).connectionStatus).toBeUndefined();
    expect(normalizeHomeMember({ userId: "u1" }).isSelf).toBeUndefined();
  });
});
