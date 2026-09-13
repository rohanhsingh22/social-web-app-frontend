import { baseApi } from "@/rtk/base-api";
import { normalizeSearchUsers } from "@/lib/normalizers";
import type { SearchUsersResponse } from "@/types/domain";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<SearchUsersResponse, string>({
      query: (publicUserId) =>
        `/users/search?q=${encodeURIComponent(publicUserId)}`,
      transformResponse: (response: unknown) => normalizeSearchUsers(response),
      providesTags: ["UserSearch"],
    }),
  }),
});

export const { useSearchUsersQuery, useLazySearchUsersQuery } = usersApi;
