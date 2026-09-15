import { skipToken } from "@reduxjs/toolkit/query";
import { baseApi } from "@/rtk/base-api";
import {
  normalizeThought,
  normalizeThoughtComment,
  normalizeThoughtCommentPage,
  normalizeThoughtPage,
} from "@/lib/normalizers";
import type {
  Thought,
  ThoughtComment,
  ThoughtCommentPage,
  ThoughtPage,
} from "@/types/domain";

export type CreateThoughtInput = {
  body: string;
};

export type ReportThoughtInput = {
  id: string;
  reason: string;
  details?: string;
};

export const thoughtsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    freshThoughts: builder.query<ThoughtPage, { cursor?: string | null }>({
      query: ({ cursor }) => {
        const params = new URLSearchParams({ limit: "20" });
        if (cursor) {
          params.set("cursor", cursor);
        }
        return `/thoughts/fresh?${params.toString()}`;
      },
      transformResponse: (response: unknown) =>
        normalizeThoughtPage(response),
      providesTags: ["Thoughts"],
    }),
    forYouThoughts: builder.query<ThoughtPage, { cursor?: string | null }>({
      query: ({ cursor }) => {
        const params = new URLSearchParams({ limit: "20" });
        if (cursor) {
          params.set("cursor", cursor);
        }
        return `/thoughts/for-you?${params.toString()}`;
      },
      transformResponse: (response: unknown) =>
        normalizeThoughtPage(response),
      providesTags: ["Thoughts"],
    }),
    thought: builder.query<Thought | null, string>({
      query: (id) => `/thoughts/${id}`,
      transformResponse: (response: unknown) => {
        const thought = normalizeThought(response);
        return thought.id === "unknown" ? null : thought;
      },
      providesTags: (_result, _error, id) => [{ type: "Thought", id }],
    }),
    createThought: builder.mutation<Thought, CreateThoughtInput>({
      query: (input) => ({
        url: "/thoughts",
        method: "POST",
        body: input,
      }),
      transformResponse: (response: unknown) => normalizeThought(response),
      invalidatesTags: ["Thoughts"],
    }),
    thoughtComments: builder.query<
      ThoughtCommentPage,
      { id: string; cursor?: string | null }
    >({
      query: ({ id, cursor }) => {
        const params = new URLSearchParams({ limit: "20" });
        if (cursor) {
          params.set("cursor", cursor);
        }
        const qs = params.toString();
        return `/thoughts/${id}/comments?${qs}`;
      },
      transformResponse: (response: unknown) =>
        normalizeThoughtCommentPage(response),
      providesTags: (_result, _error, { id }) => [
        { type: "ThoughtComments", id },
      ],
    }),
    createThoughtComment: builder.mutation<
      ThoughtComment,
      { id: string; body: string }
    >({
      query: ({ id, body }) => ({
        url: `/thoughts/${id}/comments`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: unknown) =>
        normalizeThoughtComment(response),
      invalidatesTags: (_result, _error, { id }) => [
        "Thoughts",
        { type: "Thought", id },
        { type: "ThoughtComments", id },
      ],
    }),
    likeThought: builder.mutation<{ liked: boolean }, string>({
      query: (id) => ({
        url: `/thoughts/${id}/like`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Thoughts",
        { type: "Thought", id },
      ],
    }),
    unlikeThought: builder.mutation<{ liked: boolean }, string>({
      query: (id) => ({
        url: `/thoughts/${id}/like`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Thoughts",
        { type: "Thought", id },
      ],
    }),
    shareThought: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/thoughts/${id}/share`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Thoughts",
        { type: "Thought", id },
      ],
    }),
    hideThought: builder.mutation<{ hidden: boolean }, string>({
      query: (id) => ({
        url: `/thoughts/${id}/hide`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Thoughts",
        { type: "Thought", id },
      ],
    }),
    unhideThought: builder.mutation<{ hidden: boolean }, string>({
      query: (id) => ({
        url: `/thoughts/${id}/hide`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Thoughts",
        { type: "Thought", id },
      ],
    }),
    reportThought: builder.mutation<{ ok: boolean }, ReportThoughtInput>({
      query: ({ id, reason, details }) => ({
        url: `/thoughts/${id}/report`,
        method: "POST",
        body: { reason, details },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Thoughts",
        { type: "Thought", id },
      ],
    }),
  }),
});

export const {
  useFreshThoughtsQuery,
  useLazyFreshThoughtsQuery,
  useForYouThoughtsQuery,
  useLazyForYouThoughtsQuery,
  useThoughtQuery,
  useCreateThoughtMutation,
  useThoughtCommentsQuery,
  useLazyThoughtCommentsQuery,
  useCreateThoughtCommentMutation,
  useLikeThoughtMutation,
  useUnlikeThoughtMutation,
  useShareThoughtMutation,
  useHideThoughtMutation,
  useUnhideThoughtMutation,
  useReportThoughtMutation,
} = thoughtsApi;

export function useFreshThoughts(enabled: boolean) {
  return useFreshThoughtsQuery(
    { cursor: null },
    { skip: !enabled },
  );
}

export function useForYouThoughts(enabled: boolean) {
  return useForYouThoughtsQuery(
    { cursor: null },
    { skip: !enabled },
  );
}

export function useThought(id: string | undefined, enabled: boolean) {
  return useThoughtQuery(id && enabled ? id : skipToken);
}
