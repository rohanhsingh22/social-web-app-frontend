// Backend error codes → human copy (backend spec #88-89). Match on codes,
// never on message strings. Shared by the connections dialog (Phase 12)
// and the invitation/join-request overlays (Phase 13/14).
const HOME_ERROR_COPY: Record<string, string> = {
  HOME_FULL: "This Home is full — it holds 4 people max.",
  ALREADY_IN_HOME: "You're already in a Home.",
  TARGET_ALREADY_IN_HOME: "They're already in a Home.",
  USER_ALREADY_IN_ANOTHER_HOME: "They're in another Home right now.",
  TARGET_OFFLINE: "They went offline. Try again when they're back.",
  TARGET_HAS_NO_HOME: "Their Home is gone. Try again later.",
  INVITATION_EXPIRED: "That invitation expired.",
  INVITATION_ALREADY_RESPONDED: "That invitation was already answered.",
  INVITATION_ALREADY_PENDING: "Invite already sent — waiting for them.",
  INVITATION_LIMIT_REACHED: "Too many pending invites. Wait a little.",
  JOIN_REQUEST_EXPIRED: "That request expired.",
  JOIN_REQUEST_ALREADY_RESPONDED: "That request was already answered.",
  JOIN_REQUEST_ALREADY_PENDING: "Request already sent — waiting for them.",
  JOIN_REQUEST_LIMIT_REACHED: "Too many pending requests. Wait a little.",
  NOT_A_CONNECTION: "You're no longer connected.",
  NOT_HOME_MEMBER: "You're not in a Home.",
  NOT_HOME_OWNER: "Only the Home owner can do that.",
  HOME_DESTROYED: "That Home no longer exists.",
  HOME_NOT_FOUND: "That Home no longer exists.",
  USER_UNAVAILABLE: "That user isn't available right now.",
  VOICE_UNAVAILABLE: "Voice isn't available right now. Try again later.",
  HOME_DISABLED: "Home is temporarily unavailable. Check back soon.",
  VOICE_CONNECT_FAILED: "Couldn't connect voice. Check your connection.",
  VOICE_RECONNECT_FAILED:
    "Voice keeps dropping. Check your connection and retry.",
  MICROPHONE_BLOCKED:
    "Microphone blocked. Allow access in your browser settings.",
  AUDIO_PLAYBACK_BLOCKED:
    "Audio is blocked by your browser. Tap the speaker to retry.",
};

export function homeErrorMessage(code: string | null): string {
  if (code && code in HOME_ERROR_COPY) {
    return HOME_ERROR_COPY[code] as string;
  }

  return "Something went wrong. Try again.";
}
