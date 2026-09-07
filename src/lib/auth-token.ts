import { config } from "@/lib/config";

let accessToken: string | null = null;
let tokenExpiresAt = 0;
let refreshPromise: Promise<string | null> | null = null;

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

export async function ensureFreshAccessToken(): Promise<string | null> {
  if (!isExpired()) {
    return accessToken;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          setAccessToken(null);
          return null;
        }

        const body: unknown = await response.json();
        const token = extractAccessToken(body);
        setAccessToken(token);
        return token;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
