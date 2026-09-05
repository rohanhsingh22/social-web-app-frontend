"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { baseApi } from "@/rtk/base-api";
import {
  normalizeChannel,
  normalizeChannelMessages,
  normalizeChannels,
} from "@/lib/normalizers";
import type { Channel, ChannelMessage } from "@/types/domain";

function unwrapChannelResponse(response: unknown): unknown {
  if (typeof response !== "object" || response === null || Array.isArray(response)) {
    return response;
  }

  if ("channel" in response) {
    return response.channel;
  }

  if ("data" in response) {
    return unwrapChannelResponse(response.data);
  }

  return response;
}

function normalizeOptionalChannel(response: unknown): Channel | null {
  const payload = unwrapChannelResponse(response);

  if (payload === null || payload === undefined) {
    return null;
  }

  const channel = normalizeChannel(payload);

  return channel.id === "unknown" && channel.slug === "unknown" ? null : channel;
}

export const channelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    channels: builder.query<Channel[], void>({
      query: () => "/channels",
      transformResponse: (response: unknown) => normalizeChannels(response),
      providesTags: ["Channels"],
    }),
    defaultChannel: builder.query<Channel | null, void>({
      query: () => "/channels/default",
      transformResponse: (response: unknown) => normalizeOptionalChannel(response),
      providesTags: ["Channel"],
    }),
    channel: builder.query<Channel | null, string>({
      query: (slug) => `/channels/${slug}`,
      transformResponse: (response: unknown) => normalizeOptionalChannel(response),
      providesTags: (_result, _error, slug) => [{ type: "Channel", id: slug }],
    }),
    channelMessages: builder.query<ChannelMessage[], string>({
      query: (slug) => `/channels/${slug}/messages?limit=50`,
      transformResponse: (response: unknown) => normalizeChannelMessages(response),
      providesTags: (_result, _error, slug) => [
        { type: "ChannelMessages", id: slug },
      ],
    }),
  }),
});

export const {
  useChannelMessagesQuery,
  useChannelQuery,
  useChannelsQuery,
  useDefaultChannelQuery,
} = channelsApi;

export function useChannels() {
  return useChannelsQuery();
}

export function useDefaultChannel() {
  return useDefaultChannelQuery();
}

export function useChannel(slug?: string) {
  return useChannelQuery(slug ?? skipToken);
}

export function useChannelMessages(slug?: string) {
  return useChannelMessagesQuery(slug ?? skipToken);
}
