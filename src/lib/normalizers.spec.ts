import { describe, expect, it } from "vitest";
import {
  normalizeAuthSession,
  normalizeChannelMessagePage,
  normalizeProfilePicture,
  normalizeSearchUsers,
  normalizeToliRef,
} from "./normalizers";
import { resolveToliAvatarImage } from "./toli-avatar";

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
