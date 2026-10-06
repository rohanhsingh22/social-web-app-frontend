import { skipToken } from "@reduxjs/toolkit/query";
import { baseApi } from "@/rtk/base-api";
import {
  normalizeHomeConnections,
  normalizeHomeInvitation,
  normalizeHomeJoinRequest,
  normalizeHomeState,
  normalizeHomeVoiceToken,
  normalizeLeaveHomeResult,
} from "@/lib/normalizers";
import type {
  HomeConnection,
  HomeInvitation,
  HomeJoinRequest,
  HomeState,
  HomeVoiceToken,
  LeaveHomeResult,
} from "@/types/domain";

export type InviteToHomeInput = {
  inviteeId: string;
};

export type RequestHomeJoinInput = {
  targetMemberId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrap(value: unknown, key: string): unknown {
  if (isRecord(value) && key in value) {
    return value[key];
  }

  return value;
}

export const homeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    homeState: builder.query<HomeState | null, void>({
      query: () => "/home",
      transformResponse: (response: unknown) => normalizeHomeState(response),
      providesTags: ["Home"],
    }),
    homeConnections: builder.query<HomeConnection[], void>({
      query: () => "/home/connections",
      transformResponse: (response: unknown) =>
        normalizeHomeConnections(response),
      providesTags: ["HomeConnections"],
    }),
    inviteToHome: builder.mutation<HomeInvitation, InviteToHomeInput>({
      query: (input) => ({
        url: "/home/invitations",
        method: "POST",
        body: input,
      }),
      transformResponse: (response: unknown) =>
        normalizeHomeInvitation(response),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    acceptHomeInvitation: builder.mutation<HomeState | null, string>({
      query: (id) => ({
        url: `/home/invitations/${id}/accept`,
        method: "POST",
      }),
      // The accept response carries the raw Home; the normalizer falls back
      // to safe defaults and tag invalidation refetches the rich state.
      transformResponse: (response: unknown) =>
        normalizeHomeState(unwrap(response, "home")),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    rejectHomeInvitation: builder.mutation<HomeInvitation, string>({
      query: (id) => ({
        url: `/home/invitations/${id}/reject`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeHomeInvitation(response),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    requestHomeJoin: builder.mutation<HomeJoinRequest, RequestHomeJoinInput>({
      query: (input) => ({
        url: "/home/join-requests",
        method: "POST",
        body: input,
      }),
      transformResponse: (response: unknown) =>
        normalizeHomeJoinRequest(response),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    acceptHomeJoinRequest: builder.mutation<HomeState | null, string>({
      query: (id) => ({
        url: `/home/join-requests/${id}/accept`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeHomeState(unwrap(response, "home")),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    rejectHomeJoinRequest: builder.mutation<HomeJoinRequest, string>({
      query: (id) => ({
        url: `/home/join-requests/${id}/reject`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeHomeJoinRequest(response),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    leaveHome: builder.mutation<LeaveHomeResult, void>({
      query: () => ({
        url: "/home/leave",
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeLeaveHomeResult(response),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    removeHomeMember: builder.mutation<LeaveHomeResult, string>({
      query: (userId) => ({
        url: `/home/members/${userId}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        normalizeLeaveHomeResult(response),
      invalidatesTags: ["Home", "HomeConnections"],
    }),
    homeVoiceToken: builder.mutation<HomeVoiceToken, void>({
      query: () => ({
        url: "/home/voice/token",
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeHomeVoiceToken(response),
    }),
  }),
});

export const {
  useHomeStateQuery,
  useHomeConnectionsQuery,
  useInviteToHomeMutation,
  useAcceptHomeInvitationMutation,
  useRejectHomeInvitationMutation,
  useRequestHomeJoinMutation,
  useAcceptHomeJoinRequestMutation,
  useRejectHomeJoinRequestMutation,
  useLeaveHomeMutation,
  useRemoveHomeMemberMutation,
  useHomeVoiceTokenMutation,
} = homeApi;

// Home pushes arrive over the /home socket, but polling stays as the
// fallback for dropped sockets (same pattern as connections lists).
const LIVE_QUERY_OPTIONS = {
  pollingInterval: 10_000,
  refetchOnMountOrArgChange: true,
} as const;

export function useHomeState(enabled: boolean) {
  return useHomeStateQuery(enabled ? undefined : skipToken, LIVE_QUERY_OPTIONS);
}

export function useHomeConnections(enabled: boolean) {
  return useHomeConnectionsQuery(
    enabled ? undefined : skipToken,
    LIVE_QUERY_OPTIONS,
  );
}
