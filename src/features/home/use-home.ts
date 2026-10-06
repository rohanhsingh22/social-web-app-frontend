import { useAuthSession } from "@/features/auth/api";
import { useHomeConnections, useHomeState } from "@/features/home/api";

// Home state bound to the session (Phase 9). Queries stay skipped while
// logged out so guests never hit authenticated endpoints.
export function useHome() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const homeQuery = useHomeState(isLoggedIn);

  return {
    isLoggedIn,
    authLoading: authQuery.isLoading,
    home: homeQuery.data ?? null,
    ...homeQuery,
  };
}

export function useHomeConnectionList() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const connectionsQuery = useHomeConnections(isLoggedIn);

  return {
    isLoggedIn,
    connections: connectionsQuery.data ?? [],
    ...connectionsQuery,
  };
}
