"use client";

import { baseApi } from "@/rtk/base-api";
import {
  extractAccessToken,
  setAccessToken,
} from "@/lib/auth-token";
import { normalizeAuthSession } from "@/lib/normalizers";
import type { AuthSession } from "@/types/domain";

export type AuthProviderInfo = {
  id: string;
  displayName: string;
};

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    authProviders: builder.query<AuthProviderInfo[], void>({
      query: () => "/auth/providers",
      transformResponse: (response: {
        data: { providers: AuthProviderInfo[] };
      }) => response.data.providers,
    }),
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

        setAccessToken(extractAccessToken(result.data));

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
          setAccessToken(null);
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useAuthProvidersQuery,
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
