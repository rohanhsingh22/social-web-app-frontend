import { baseApi } from "@/rtk/base-api";
import {
  normalizeConnection,
  normalizeConnectionRequest,
  normalizeConnectionRequests,
  normalizeConnections,
} from "@/lib/normalizers";
import type { Connection, ConnectionRequest } from "@/types/domain";

export type CreateConnectionRequestInput = {
  receiverUserId: string;
};

export const connectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    connections: builder.query<Connection[], void>({
      query: () => "/connections",
      transformResponse: (response: unknown) => normalizeConnections(response),
      providesTags: ["Connections"],
    }),
    receivedRequests: builder.query<ConnectionRequest[], void>({
      query: () => "/connections/requests/received",
      transformResponse: (response: unknown) =>
        normalizeConnectionRequests(response),
      providesTags: ["Connections"],
    }),
    sentRequests: builder.query<ConnectionRequest[], void>({
      query: () => "/connections/requests/sent",
      transformResponse: (response: unknown) =>
        normalizeConnectionRequests(response),
      providesTags: ["Connections"],
    }),
    createConnectionRequest: builder.mutation<
      ConnectionRequest,
      CreateConnectionRequestInput
    >({
      query: (input) => ({
        url: "/connections/requests",
        method: "POST",
        body: input,
      }),
      transformResponse: (response: unknown) => {
        const payload = isRecord(response) ? response : {};
        return normalizeConnectionRequest(payload.request ?? payload);
      },
      invalidatesTags: ["Connections", "UserSearch"],
    }),
    acceptRequest: builder.mutation<ConnectionRequest, string>({
      query: (id) => ({
        url: `/connections/requests/${id}/accept`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeConnectionRequest(response),
      invalidatesTags: ["Connections", "DmConversations"],
    }),
    rejectRequest: builder.mutation<ConnectionRequest, string>({
      query: (id) => ({
        url: `/connections/requests/${id}/reject`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeConnectionRequest(response),
      invalidatesTags: ["Connections"],
    }),
    cancelRequest: builder.mutation<ConnectionRequest, string>({
      query: (id) => ({
        url: `/connections/requests/${id}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeConnectionRequest(response),
      invalidatesTags: ["Connections"],
    }),
    removeConnection: builder.mutation<Connection, string>({
      query: (id) => ({
        url: `/connections/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        normalizeConnection(response),
      invalidatesTags: ["Connections", "DmConversations"],
    }),
  }),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const {
  useConnectionsQuery,
  useReceivedRequestsQuery,
  useSentRequestsQuery,
  useCreateConnectionRequestMutation,
  useAcceptRequestMutation,
  useRejectRequestMutation,
  useCancelRequestMutation,
  useRemoveConnectionMutation,
} = connectionsApi;
