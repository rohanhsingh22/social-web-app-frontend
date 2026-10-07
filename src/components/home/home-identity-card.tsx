import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAcceptRequestMutation,
  useCancelRequestMutation,
  useCreateConnectionRequestMutation,
  useReceivedRequestsQuery,
  useRejectRequestMutation,
  useSentRequestsQuery,
} from "@/rtk/connections/connections-api";
import type { HomeMember } from "@/types/domain";
import { getIdentityCardState } from "./home-identity";

// Character identity/action card (spec §22, Phase 7 task 8).
// Opens from a click/tap on a Home character. Every action derives from
// authoritative relationship state: member.connectionStatus (server) plus
// the pending-request lists for request ids. Home membership alone never
// implies a connection action.
export function HomeIdentityCard({
  member,
  open,
  onOpenChange,
}: {
  member: HomeMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const state = getIdentityCardState(member);
  const [failed, setFailed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [createRequest] = useCreateConnectionRequestMutation();
  const [acceptRequest] = useAcceptRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [cancelRequest] = useCancelRequestMutation();
  // Request ids only matter for pending states — skip otherwise.
  const needRequests =
    state.status === "request_sent" || state.status === "request_received";
  const received = useReceivedRequestsQuery(undefined, { skip: !needRequests });
  const sent = useSentRequestsQuery(undefined, { skip: !needRequests });
  const incomingId = received.data?.find(
    (r) => r.requesterId === member.userId,
  )?.id;
  const outgoingId = sent.data?.find(
    (r) => r.receiverId === member.userId,
  )?.id;
  const profileHref = member.publicUserId
    ? `/profile/${member.publicUserId}`
    : "/profile";

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setFailed(null);
    try {
      await action();
      onOpenChange(false);
    } catch {
      setFailed("That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {member.displayName}
            {state.isSelf ? " (You)" : ""}
          </DialogTitle>
          <DialogDescription>
            {state.isOwner ? "Home Owner" : "Home Member"}
            {member.presence === "offline" ? " · Offline" : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {state.status === "connected" && (
            <p className="text-sm text-ink-subtle">Connected</p>
          )}
          {state.status === "request_sent" && (
            <p className="text-sm text-ink-subtle">Request sent</p>
          )}
          {failed && (
            <p role="alert" className="text-sm text-danger-ink">
              {failed}
            </p>
          )}
          {state.actions.includes("view-profile") && (
            <Button asChild variant="secondary" disabled={busy}>
              <Link to={profileHref}>View Profile</Link>
            </Button>
          )}
          {state.actions.includes("add-connection") && (
            <Button
              disabled={busy}
              onClick={() =>
                void run(() =>
                  createRequest({ receiverUserId: member.userId }).unwrap(),
                )
              }
            >
              Add Connection
            </Button>
          )}
          {state.actions.includes("accept-request") && (
            <Button
              disabled={busy || !incomingId}
              onClick={() =>
                incomingId && void run(() => acceptRequest(incomingId).unwrap())
              }
            >
              Accept Request
            </Button>
          )}
          {state.actions.includes("reject-request") && (
            <Button
              variant="secondary"
              disabled={busy || !incomingId}
              onClick={() =>
                incomingId && void run(() => rejectRequest(incomingId).unwrap())
              }
            >
              Reject
            </Button>
          )}
          {state.actions.includes("cancel-request") && (
            <Button
              variant="secondary"
              disabled={busy || !outgoingId}
              onClick={() =>
                outgoingId && void run(() => cancelRequest(outgoingId).unwrap())
              }
            >
              Cancel Request
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
