import type { HomeMember } from "@/types/domain";

// Identity-card state derivation (spec §22, Phase 7).
// Pure decision table over AUTHORITATIVE server signals — the card never
// infers connection status from Home membership. Unknown statuses degrade
// to the safest action (view-only).

export type IdentityConnectionStatus =
  | "self"
  | "none"
  | "connected"
  | "request_sent"
  | "request_received"
  | "blocked";

export type IdentityCardAction =
  | "view-profile"
  | "add-connection"
  | "accept-request"
  | "reject-request"
  | "cancel-request";

export type IdentityCardState = {
  isSelf: boolean;
  isOwner: boolean;
  status: IdentityConnectionStatus;
  /** Ordered actions the card may offer. */
  actions: IdentityCardAction[];
};

const KNOWN_STATUSES: IdentityConnectionStatus[] = [
  "self",
  "none",
  "connected",
  "request_sent",
  "request_received",
  "blocked",
];

export function getIdentityCardState(member: HomeMember): IdentityCardState {
  const isSelf = member.isSelf ?? false;
  const isOwner = member.isOwner ?? member.role === "OWNER";
  const raw = isSelf ? "self" : (member.connectionStatus ?? "none");
  const status: IdentityConnectionStatus = KNOWN_STATUSES.includes(
    raw as IdentityConnectionStatus,
  )
    ? (raw as IdentityConnectionStatus)
    : "none";

  let actions: IdentityCardAction[];
  switch (status) {
    case "self":
      actions = ["view-profile"];
      break;
    case "connected":
      actions = ["view-profile"];
      break;
    case "request_sent":
      actions = ["view-profile", "cancel-request"];
      break;
    case "request_received":
      actions = ["view-profile", "accept-request", "reject-request"];
      break;
    case "blocked":
      actions = ["view-profile"];
      break;
    case "none":
    default:
      actions = ["view-profile", "add-connection"];
      break;
  }
  return { isSelf, isOwner, status, actions };
}
