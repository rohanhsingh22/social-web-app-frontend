import { skipToken } from "@reduxjs/toolkit/query";
import { baseApi } from "@/rtk/base-api";
import {
  normalizeChannel,
  normalizeChannelMessagePage,
  normalizeProfile,
  normalizeToli,
  normalizeTolis,
} from "@/lib/normalizers";
import type { Channel, ChannelMessagePage, Profile, Toli } from "@/types/domain";

export type SelectToliInput = {
  toliId: string | null;
};

// The backend wraps payloads as `{ data: { channel } }`. Unwrap recursively
// (same as channels-api): a single-level unwrap leaves `{ channel }`, which
// normalizeChannel turns into `id: "unknown"` → null, hiding the room forever.
function unwrapToliChannelResponse(response: unknown): unknown {
  if (typeof response !== "object" || response === null || Array.isArray(response)) {
    return response;
  }

  if ("channel" in response) {
    return response.channel;
  }

  if ("data" in response) {
    return unwrapToliChannelResponse(response.data);
  }

  return response;
}

export const toliApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    tolis: builder.query<Toli[], void>({
      query: () => "/tolis",
      transformResponse: (response: unknown) => normalizeTolis(response),
      providesTags: ["Tolis"],
    }),
    toli: builder.query<Toli | null, string>({
      query: (idOrName) => `/tolis/${idOrName}`,
      transformResponse: (response: unknown) => {
        const toli = normalizeToli(response);
        return toli.id === "unknown" ? null : toli;
      },
      providesTags: (_result, _error, idOrName) => [
        { type: "Tolis", id: idOrName },
      ],
    }),
    selectToli: builder.mutation<Profile, SelectToliInput>({
      query: (input) => ({
        url: "/profiles/me/toli",
        method: "PUT",
        body: input,
      }),
      transformResponse: (response: unknown) => normalizeProfile(response),
      invalidatesTags: ["AuthSession", "Profile", "ToliChannel", "ToliMessages"],
    }),
    myToliChannel: builder.query<Channel | null, void>({
      query: () => "/channels/toli/mine",
      transformResponse: (response: unknown) => {
        const payload = unwrapToliChannelResponse(response);
        if (payload === null || payload === undefined) {
          return null;
        }
        const channel = normalizeChannel(payload);
        return channel.id === "unknown" ? null : channel;
      },
      providesTags: ["ToliChannel"],
    }),
    myToliChannelMessages: builder.query<
      ChannelMessagePage,
      { cursor?: string | null }
    >({
      query: ({ cursor }) => {
        const params = new URLSearchParams({ limit: "50" });
        if (cursor) {
          params.set("cursor", cursor);
        }
        return `/channels/toli/mine/messages?${params.toString()}`;
      },
      transformResponse: (response: unknown) =>
        normalizeChannelMessagePage(response),
      providesTags: ["ToliMessages"],
    }),
  }),
});

export const {
  useTolisQuery,
  useToliQuery,
  useSelectToliMutation,
  useMyToliChannelQuery,
  useLazyMyToliChannelMessagesQuery,
  useMyToliChannelMessagesQuery,
} = toliApi;

export function useTolis() {
  return useTolisQuery();
}

export function useMyToliChannel(enabled: boolean) {
  return useMyToliChannelQuery(enabled ? undefined : skipToken);
}

export function useMyToliChannelMessages(
  cursor: string | null | undefined,
  enabled: boolean,
) {
  return useMyToliChannelMessagesQuery(
    enabled ? { cursor: cursor ?? null } : skipToken,
    // Same stale-cache reason as useChannelMessages: refetch latest page on
    // mount so returning to the Toli room shows new messages.
    { refetchOnMountOrArgChange: true },
  );
}
