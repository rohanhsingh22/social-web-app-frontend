import { baseApi } from "@/rtk/base-api";
import {
  getAccessToken,
  refreshSessionOnce,
  setAccessToken,
  type RefreshOutcome,
} from "@/lib/auth-token";
import { normalizeAuthSession } from "@/lib/normalizers";
import type { AuthSession } from "@/types/domain";

export type AuthProviderInfo = {
  id: string;
  displayName: string;
};

function toSessionResult(outcome: RefreshOutcome) {
  if (outcome.status === "ok") {
    return { data: normalizeAuthSession(outcome.body) };
  }

  if (outcome.status === "unauthorized") {
    return { data: null };
  }

  return {
    error: { status: "FETCH_ERROR" as const, error: "Session refresh failed" },
  };
}

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
        if (getAccessToken()) {
          const result = await baseQuery("/auth/me");

          if (result.error) {
            const status = result.error.status;

            if (status === 401 || status === 403) {
              return { data: null };
            }

            return { error: result.error };
          }

          return { data: normalizeAuthSession(result.data) };
        }

        // No token in memory: join the single shared refresh instead of
        // firing a request that would race the 401-retry path.
        return toSessionResult(await refreshSessionOnce());
      },
      providesTags: ["AuthSession"],
    }),
    refreshSession: builder.mutation<AuthSession | null, void>({
      async queryFn() {
        // Forced rotation (no expiry short-circuit), still shared when
        // concurrent callers are already refreshing.
        return toSessionResult(await refreshSessionOnce());
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
