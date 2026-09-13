import { skipToken } from "@reduxjs/toolkit/query";
import { baseApi } from "@/rtk/base-api";
import {
  normalizeDmConversations,
  normalizeDmMessagePage,
  normalizeDirectMessage,
} from "@/lib/normalizers";
import type { DmConversation, DmMessagePage, DirectMessage } from "@/types/domain";

export const dmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dmConversations: builder.query<DmConversation[], string>({
      query: () => "/dm/conversations",
      transformResponse: (response: unknown, _meta, userId) =>
        normalizeDmConversations(response, userId),
      providesTags: ["DmConversations"],
    }),
    dmMessages: builder.query<
      DmMessagePage,
      { conversationId: string; userId: string; cursor?: string | null }
    >({
      query: ({ conversationId, cursor }) => {
        const params = new URLSearchParams();
        if (cursor) {
          params.set("cursor", cursor);
        }
        const qs = params.toString();
        return `/dm/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeDmMessagePage(response, arg.userId),
      providesTags: (_result, _error, arg) => [
        { type: "DmMessages", id: arg.conversationId },
      ],
    }),
  }),
});

export const {
  useDmConversationsQuery,
  useDmMessagesQuery,
  useLazyDmMessagesQuery,
} = dmApi;

export function useDmConversations(userId: string | null) {
  return useDmConversationsQuery(userId ? userId : skipToken);
}

export function useDmMessages(
  conversationId: string,
  userId: string | null,
) {
  return useDmMessagesQuery(
    conversationId && userId
      ? { conversationId, userId }
      : skipToken,
  );
}

export function normalizeDmMessageForSocket(value: unknown): DirectMessage {
  return normalizeDirectMessage(value);
}
