// Invitation/request countdowns (spec #86: 20s, frontend timer visual only,
// expiry authoritative server-side).
export const HOME_OFFER_TTL_SECONDS = 20;

export function remainingSeconds(
  expiresAtIso: string,
  nowMs: number = Date.now(),
): number {
  const expiresMs = Date.parse(expiresAtIso);

  if (!Number.isFinite(expiresMs)) {
    return HOME_OFFER_TTL_SECONDS;
  }

  return Math.max(0, Math.ceil((expiresMs - nowMs) / 1000));
}
