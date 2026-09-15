import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { config } from "@/lib/config";
import { ensureFreshAccessToken, getAccessToken, clearAccessToken } from "@/lib/auth-token";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: config.apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const requestUrl = typeof args === "string" ? args : args.url;
  const canRefresh = requestUrl !== "/auth/refresh";

  if (canRefresh && result.error && result.error.status === 401) {
    const freshToken = await ensureFreshAccessToken();

    if (freshToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearAccessToken();
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "AuthSession",
    "Channels",
    "Channel",
    "ChannelMessages",
    "Profile",
    "Settings",
    "UserSearch",
    "Connections",
    "DmConversations",
    "DmMessages",
    "Tolis",
    "ToliChannel",
    "ToliMessages",
    "Thoughts",
    "Thought",
    "ThoughtComments",
    "Notifications",
  ],
  endpoints: () => ({}),
});
