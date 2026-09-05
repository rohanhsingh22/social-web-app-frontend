import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { config } from "@/lib/config";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  }),
  tagTypes: ["AuthSession", "Channels", "Channel", "ChannelMessages", "Profile"],
  endpoints: () => ({}),
});
