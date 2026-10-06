// Voice rejoin policy (Phase 16): brief drops ride LiveKit's internal
// retry; terminal drops rejoin with a FRESH token (tokens expire — the SDK
// offers no in-place refresh, so rejoin is the refresh). Membership is never
// touched by any of this.

export const MAX_VOICE_REJOIN_ATTEMPTS = 5;

const REJOIN_BASE_DELAY_MS = 1000;
const REJOIN_MAX_DELAY_MS = 15_000;

export function reconnectDelay(attempt: number): number {
  const backoff = REJOIN_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1);
  return Math.min(backoff, REJOIN_MAX_DELAY_MS);
}

export function shouldAutoRejoin(input: {
  autoConnect: boolean;
  homeId: string | null;
  connectionState: string;
  intentional: boolean;
  attempts: number;
}): boolean {
  return (
    input.autoConnect &&
    input.homeId !== null &&
    input.connectionState === "disconnected" &&
    !input.intentional &&
    input.attempts < MAX_VOICE_REJOIN_ATTEMPTS
  );
}
