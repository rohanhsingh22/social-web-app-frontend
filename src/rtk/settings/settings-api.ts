"use client";

import { baseApi } from "@/rtk/base-api";

export type ThemePreference = "light" | "dark" | "system";

export type ProfileVisibility = {
  avatar?: boolean;
  bio?: boolean;
  dob?: boolean;
  age?: boolean;
  gender?: boolean;
  region?: boolean;
  city?: boolean;
  primaryLanguage?: boolean;
  languages?: boolean;
};

export type UserSettings = {
  theme: ThemePreference;
  accentColor: string;
  profileVisibility: ProfileVisibility;
};

export type SettingsUpdateInput = {
  theme?: ThemePreference;
  accentColor?: string;
  profileVisibility?: Partial<ProfileVisibility>;
};

function normalizeSettings(response: unknown): UserSettings {
  const data = (response as { data?: Record<string, unknown> })?.data ?? {};
  const settings = (data.settings ?? data) as Record<string, unknown>;

  return {
    theme: (settings.theme as ThemePreference) ?? "system",
    accentColor: (settings.accentColor as string) ?? "blue",
    profileVisibility: (settings.profileVisibility as ProfileVisibility) ?? {},
  };
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    settings: builder.query<UserSettings, void>({
      query: () => "/settings",
      transformResponse: normalizeSettings,
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<UserSettings, SettingsUpdateInput>({
      query: (input) => ({
        url: "/settings",
        method: "PATCH",
        body: input,
      }),
      transformResponse: normalizeSettings,
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useSettingsQuery, useUpdateSettingsMutation } = settingsApi;
