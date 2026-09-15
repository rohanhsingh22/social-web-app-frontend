import { skipToken } from "@reduxjs/toolkit/query";
import { baseApi } from "@/rtk/base-api";
import { normalizeDisplayNameAvailability, normalizeProfile, normalizeProfilePictureState } from "@/lib/normalizers";
import type { Profile, ProfilePictureState } from "@/types/domain";

export type DisplayNameAvailability = {
  available: boolean;
  displayName: string;
};

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
  interests?: string[];
};

export type ProfilePictureInput = {
  type: "provider" | "toli";
  avatarKey?: string;
};

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myProfile: builder.query<Profile, void>({
      query: () => "/profiles/me",
      transformResponse: (response: unknown) => normalizeProfile(response),
      providesTags: ["Profile"],
    }),
    publicProfile: builder.query<Profile, string>({
      query: (publicUserId) => `/profiles/${publicUserId}`,
      transformResponse: (response: unknown) => normalizeProfile(response),
      providesTags: (_result, _error, publicUserId) => [
        { type: "Profile", id: publicUserId },
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
    displayNameAvailability: builder.query<DisplayNameAvailability, string>({
      query: (displayName) =>
        `/profiles/check-display-name?displayName=${encodeURIComponent(displayName)}`,
      transformResponse: (response: unknown) =>
        normalizeDisplayNameAvailability(response),
    }),
    myProfilePicture: builder.query<ProfilePictureState, void>({
      query: () => "/profiles/me/picture",
      transformResponse: (response: unknown) =>
        normalizeProfilePictureState(response),
      providesTags: ["Profile"],
    }),
    updateProfilePicture: builder.mutation<ProfilePictureState, ProfilePictureInput>({
      query: (input) => ({
        url: "/profiles/me/picture",
        method: "PUT",
        body: input,
      }),
      transformResponse: (response: unknown) =>
        normalizeProfilePictureState(response),
      invalidatesTags: ["AuthSession", "Profile"],
    }),
  }),
});

export const {
  useMyProfileQuery,
  usePublicProfileQuery,
  useUpdateMyProfileMutation,
  useLazyDisplayNameAvailabilityQuery,
  useMyProfilePictureQuery,
  useUpdateProfilePictureMutation,
} = profileApi;

export function useMyProfile(enabled: boolean) {
  return useMyProfileQuery(enabled ? undefined : skipToken);
}

export function usePublicProfile(publicUserId: string, enabled: boolean) {
  return usePublicProfileQuery(enabled && publicUserId ? publicUserId : skipToken);
}

export function useUpdateMyProfile() {
  const [updateMyProfile, state] = useUpdateMyProfileMutation();

  return {
    ...state,
    isPending: state.isLoading,
    mutateAsync: (input: ProfileUpdateInput) => updateMyProfile(input).unwrap(),
  };
}
