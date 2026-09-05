"use client";

import { baseApi } from "@/rtk/base-api";
import { normalizeAuthSession } from "@/lib/normalizers";
import type { AuthSession } from "@/types/domain";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    authSession: builder.query<AuthSession | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery("/auth/me");

        if (result.error) {
          const status = result.error.status;

          if (status === 401 || status === 403) {
            return { data: null };
          }

          return { error: result.error };
        }

        return { data: normalizeAuthSession(result.data) };
      },
      providesTags: ["AuthSession"],
    }),
    refreshSession: builder.mutation<AuthSession | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: "/auth/refresh",
          method: "POST",
        });

        if (result.error) {
          const status = result.error.status;

          if (status === 401 || status === 403) {
            return { data: null };
          }

          return { error: result.error };
        }

        return { data: normalizeAuthSession(result.data) };
      },
      invalidatesTags: ["AuthSession"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useAuthSessionQuery,
  useLogoutMutation,
  useRefreshSessionMutation,
} = authApi;

export function useAuthSession() {
  return useAuthSessionQuery();
}

export function useLogout() {
  const [logout, state] = useLogoutMutation();

  return {
    ...state,
    isPending: state.isLoading,
    mutateAsync: () => logout().unwrap(),
  };
}
