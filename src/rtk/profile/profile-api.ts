"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { baseApi } from "@/rtk/base-api";
import { normalizeProfile } from "@/lib/normalizers";
import type { Profile } from "@/types/domain";

export type ProfileUpdateInput = {
  username?: string;
  displayName?: string;
  bio?: string;
  dob?: string;
  region?: string;
  city?: string;
  gender?: string;
  characterConfig?: {
    gender?: "male" | "female";
    skinColor?: string;
    hairColor?: string;
    outfitColor?: string;
  };
  primaryLanguage?: string;
  languages?: string[];
};

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myProfile: builder.query<Profile, void>({
      query: () => "/profiles/me",
      transformResponse: (response: unknown) => normalizeProfile(response),
      providesTags: ["Profile"],
    }),
    publicProfile: builder.query<Profile, string>({
      query: (username) => `/profiles/${username}`,
      transformResponse: (response: unknown) => normalizeProfile(response),
      providesTags: (_result, _error, username) => [
        { type: "Profile", id: username },
      ],
    }),
    updateMyProfile: builder.mutation<Profile, ProfileUpdateInput>({
      query: (input) => ({
        url: "/profiles/me",
        method: "PATCH",
        body: input,
      }),
      transformResponse: (response: unknown) => normalizeProfile(response),
      invalidatesTags: ["AuthSession", "Profile"],
    }),
  }),
});

export const {
  useMyProfileQuery,
  usePublicProfileQuery,
  useUpdateMyProfileMutation,
} = profileApi;

export function useMyProfile(enabled: boolean) {
  return useMyProfileQuery(enabled ? undefined : skipToken);
}

export function usePublicProfile(username: string, enabled: boolean) {
  return usePublicProfileQuery(enabled && username ? username : skipToken);
}

export function useUpdateMyProfile() {
  const [updateMyProfile, state] = useUpdateMyProfileMutation();

  return {
    ...state,
    isPending: state.isLoading,
    mutateAsync: (input: ProfileUpdateInput) => updateMyProfile(input).unwrap(),
  };
}
