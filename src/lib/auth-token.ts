import { config } from "@/lib/config";

let accessToken: string | null = null;
let tokenExpiresAt = 0;
let refreshPromise: Promise<RefreshOutcome> | null = null;

const REFRESH_SKEW_MS = 30_000;
const FALLBACK_TTL_MS = 14 * 60 * 1000;

function decodeExpiry(token: string): number {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return 0;
    }

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: unknown };

    const exp = Number(payload.exp);
    return Number.isFinite(exp) ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function setAccessToken(token: string | null | undefined) {
  if (typeof token === "string" && token.length > 0) {
    accessToken = token;
    tokenExpiresAt = decodeExpiry(token) || Date.now() + FALLBACK_TTL_MS;
  } else {
    accessToken = null;
    tokenExpiresAt = 0;
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  tokenExpiresAt = 0;
  refreshPromise = null;
}

function isExpired(): boolean {
  return (
    !accessToken ||
    tokenExpiresAt === 0 ||
    Date.now() >= tokenExpiresAt - REFRESH_SKEW_MS
  );
}

export function extractAccessToken(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const data = record.data;

  if (typeof data === "object" && data !== null) {
    const token = (data as Record<string, unknown>).accessToken;
    if (typeof token === "string" && token.length > 0) {
      return token;
    }
  }

  if (typeof record.accessToken === "string" && record.accessToken.length > 0) {
    return record.accessToken;
  }

  return null;
}

export type RefreshOutcome =
  | { status: "ok"; token: string; body: unknown }
  | { status: "unauthorized"; token: null; body: null }
  | { status: "error"; token: null; body: null };

async function doRefresh(): Promise<RefreshOutcome> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      setAccessToken(null);
      return {
        status:
          response.status === 401 || response.status === 403
            ? "unauthorized"
            : "error",
        token: null,
        body: null,
      };
    }

    const body: unknown = await response.json();
    const token = extractAccessToken(body);
    setAccessToken(token);

    if (!token) {
      return { status: "error", token: null, body: null };
    }

    return { status: "ok", token, body };
  } catch {
    setAccessToken(null);
    return { status: "error", token: null, body: null };
  }
}

// Single shared in-flight refresh for the whole app. The backend rotates
// (revokes) the refresh token on every success, so two concurrent
// POST /auth/refresh calls guarantee one 401. Every trigger — session
// bootstrap, explicit refresh, 401 retry, socket reconnect — must join this
// promise instead of firing its own request.
export function refreshSessionOnce(): Promise<RefreshOutcome> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function ensureFreshAccessToken(): Promise<string | null> {
  if (!isExpired()) {
    return accessToken;
  }

  const outcome = await refreshSessionOnce();
  return outcome.token;
}
