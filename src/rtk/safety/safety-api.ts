import { baseApi } from "@/rtk/base-api";
import { normalizeProfilePicture } from "@/lib/normalizers";
import type { ConnectionProfile, ConnectionUser } from "@/types/domain";

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_or_abuse"
  | "sexual_content"
  | "fake_profile"
  | "underage_safety"
  | "other";

export const REPORT_REASONS: ReportReason[] = [
  "spam",
  "harassment",
  "hate_or_abuse",
  "sexual_content",
  "fake_profile",
  "underage_safety",
  "other",
];

export function reportReasonLabel(reason: ReportReason): string {
  return reason.replaceAll("_", " ");
}

export type CreateReportInput = {
  targetUserId?: string;
  targetChannelMessageId?: string;
  targetDirectMessageId?: string;
  reason: ReportReason;
  details?: string;
};

export type SafetyReport = {
  id: string;
  status: string;
  createdAt: string;
};

export type BlockedEntry = {
  id: string;
  blockedUserId: string;
  createdAt: string;
  blockedUser: ConnectionUser & { publicUserId?: string };
};

export type UnblockResult = {
  blockedUserId: string;
  removed: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function unwrapData(response: unknown): Record<string, unknown> {
  if (!isRecord(response)) {
    return {};
  }
  const data = response.data;
  return isRecord(data) ? data : {};
}

function normalizeSafetyReport(value: unknown): SafetyReport {
  const record = isRecord(value) ? value : {};
  return {
    id: asString(record.id, "unknown"),
    status: asString(record.status, "open"),
    createdAt: asString(record.createdAt ?? record.created_at, ""),
  };
}

function normalizeBlockedProfile(value: unknown): ConnectionProfile | null {
  if (!isRecord(value)) {
    return null;
  }
  const toli =
    isRecord(value.toli) && typeof value.toli.id === "string" && typeof value.toli.name === "string"
      ? { id: value.toli.id, name: value.toli.name }
      : null;
  const languages = Array.isArray(value.languages)
    ? value.languages.filter((item): item is string => typeof item === "string")
    : [];
  return {
    username: asString(value.username, "unknown"),
    displayName: asString(value.displayName ?? value.display_name, "Unknown user"),
    avatarUrl: asOptionalString(value.avatarUrl ?? value.avatar_url) ?? undefined,
    profilePicture: normalizeProfilePicture(
      value.profilePicture ?? value.profile_picture ?? value,
    ),
    toli,
    bio: asOptionalString(value.bio),
    ageGroup: asOptionalString(value.ageGroup ?? value.age_group),
    region: asOptionalString(value.region),
    primaryLanguage: asOptionalString(
      value.primaryLanguage ?? value.primary_language,
    ),
    languages,
  };
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeBlockedEntry(value: unknown): BlockedEntry {
  const record = isRecord(value) ? value : {};
  const blockedUser = isRecord(record.blockedUser) ? record.blockedUser : {};
  return {
    id: asString(record.id, "unknown"),
    blockedUserId: asString(record.blockedUserId ?? record.blocked_user_id, ""),
    createdAt: asString(record.createdAt ?? record.created_at, ""),
    blockedUser: {
      id: asString(blockedUser.id, "unknown"),
      publicUserId:
        asOptionalString(
          blockedUser.publicUserId ?? blockedUser.public_user_id,
        ) ?? undefined,
      profile: normalizeBlockedProfile(blockedUser.profile),
    },
  };
}

export const safetyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation<SafetyReport, CreateReportInput>({
      query: (input) => ({
        url: "/reports",
        method: "POST",
        body: input,
      }),
      transformResponse: (response: unknown) =>
        normalizeSafetyReport(unwrapData(response).report),
      invalidatesTags: ["Reports"],
    }),
    blocks: builder.query<BlockedEntry[], void>({
      query: () => "/blocks",
      transformResponse: (response: unknown) => {
        const blocks = unwrapData(response).blocks;
        return Array.isArray(blocks) ? blocks.map(normalizeBlockedEntry) : [];
      },
      providesTags: ["Blocks"],
    }),
    blockUser: builder.mutation<BlockedEntry, { blockedUserId: string }>({
      query: (input) => ({
        url: "/blocks",
        method: "POST",
        body: input,
      }),
      transformResponse: (response: unknown) =>
        normalizeBlockedEntry(unwrapData(response).block),
      // Blocking flips connections + search visibility for the pair.
      invalidatesTags: ["Blocks", "Connections", "UserSearch", "DmConversations"],
    }),
    unblockUser: builder.mutation<UnblockResult, string>({
      query: (blockedUserId) => ({
        url: `/blocks/${encodeURIComponent(blockedUserId)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => {
        const result = unwrapData(response);
        return {
          blockedUserId: asString(
            result.blockedUserId ?? result.blocked_user_id,
          ),
          removed: result.removed === true,
        };
      },
      invalidatesTags: ["Blocks", "Connections", "UserSearch"],
    }),
  }),
});

export const {
  useCreateReportMutation,
  useBlocksQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
} = safetyApi;
