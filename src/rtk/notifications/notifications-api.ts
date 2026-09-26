import { baseApi } from "@/rtk/base-api";
import { normalizeNotificationsPage } from "@/lib/normalizers";
import type { NotificationsPage } from "@/types/domain";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    notifications: builder.query<NotificationsPage, { cursor?: string | null }>({
      query: ({ cursor }) => {
        const params = new URLSearchParams({ limit: "20" });
        if (cursor) {
          params.set("cursor", cursor);
        }
        return `/notifications?${params.toString()}`;
      },
      transformResponse: (response: unknown) =>
        normalizeNotificationsPage(response),
      providesTags: ["Notifications"],
    }),
    unreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (response: unknown) => {
        const record =
          response && typeof response === "object" && "data" in response
            ? (response.data as Record<string, unknown>)
            : {};
        const count = record.unreadCount;
        return {
          unreadCount:
            typeof count === "number" && Number.isFinite(count)
              ? count
              : 0,
        };
      },
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markNotificationsRead: builder.mutation<
      { ok: boolean },
      { conversationId?: string }
    >({
      query: (input) => ({
        url: "/notifications/read",
        method: "POST",
        body: input.conversationId
          ? { conversationId: input.conversationId }
          : {},
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useNotificationsQuery,
  useLazyNotificationsQuery,
  useUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadMutation,
} = notificationsApi;

export function useNotifications(enabled: boolean) {
  return useNotificationsQuery(
    { cursor: null },
    { skip: !enabled, pollingInterval: 30_000 },
  );
}

export function useUnreadCount(enabled: boolean) {
  const result = useUnreadCountQuery(undefined, {
    skip: !enabled,
    pollingInterval: 30_000,
  });

  return {
    ...result,
    unreadCount: result.data?.unreadCount ?? 0,
  };
}
