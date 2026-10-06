import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHomeConnections } from "@/features/home/api";
import {
  getHomeErrorCode,
  useHomeActions,
} from "@/features/home/use-home-actions";
import {
  HOME_OFFER_TTL_SECONDS,
  remainingSeconds,
} from "@/features/home/home-countdown";
import { homeErrorMessage } from "@/features/home/home-errors";
import { HomeFullDialog } from "@/components/home/home-full-dialog";
import type { HomeInvitation } from "@/types/domain";

// Incoming Home invitation popup (spec #86): global overlay, 20s visual
// countdown, Accept/Reject. No room terminology, no separate page.
export function HomeInvitationDialog({
  invitation,
  onDone,
}: {
  invitation: HomeInvitation;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const actions = useHomeActions();
  const { data: connections = [] } = useHomeConnections(true);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    remainingSeconds(invitation.expiresAt),
  );
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const [fullOpen, setFullOpen] = useState(false);
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);

  const inviterName =
    connections.find((c) => c.userId === invitation.inviterId)?.displayName ??
    "Someone";

  useEffect(() => {
    setSecondsLeft(remainingSeconds(invitation.expiresAt));
    setFailedCode(null);
    setFullOpen(false);
    setBusy(null);
  }, [invitation.id, invitation.expiresAt]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDone();
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft(remainingSeconds(invitation.expiresAt));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [invitation.expiresAt, secondsLeft, onDone]);

  async function handleAccept() {
    setBusy("accept");
    setFailedCode(null);
    try {
      await actions.acceptInvitation(invitation.id).unwrap();
      onDone();
      navigate("/home");
    } catch (error) {
      const code = getHomeErrorCode(error);
      if (code === "HOME_FULL") {
        onDone();
        setFullOpen(true);
        return;
      }
      setFailedCode(code);
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    setBusy("reject");
    setFailedCode(null);
    try {
      await actions.rejectInvitation(invitation.id).unwrap();
    } catch (error) {
      const code = getHomeErrorCode(error);
      // Expired invites reject the same as dismissal — only surface the
      // unexpected.
      if (code !== "INVITATION_EXPIRED") {
        setFailedCode(code);
        setBusy(null);
        return;
      }
    }
    onDone();
  }

  return (
    <>
      <div
        role="alertdialog"
        aria-label={`Invitation from ${inviterName}`}
        aria-describedby="home-invitation-countdown"
        className="fixed inset-x-4 bottom-20 z-50 mx-auto w-full max-w-sm rounded-3xl border border-line bg-surface p-4 shadow-xl sm:inset-x-auto sm:bottom-8 sm:right-8 sm:mx-0"
      >
        <p className="text-sm text-ink">
          <span className="font-semibold">{inviterName}</span> invited you to
          their Home
        </p>
        <p
          id="home-invitation-countdown"
          className="mt-1 text-xs text-ink-muted"
          aria-live="polite"
        >
          Expires in {secondsLeft}s
        </p>
        <div
          aria-hidden
          className="mt-2 h-1 overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-1000"
            style={{
              width: `${Math.min(100, (secondsLeft / HOME_OFFER_TTL_SECONDS) * 100)}%`,
            }}
          />
        </div>
        {failedCode !== null && (
          <p role="alert" className="mt-2 text-xs text-danger-ink">
            {homeErrorMessage(failedCode)}
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={busy !== null}
            onClick={() => void handleReject()}
          >
            Reject
          </Button>
          <Button disabled={busy !== null} onClick={() => void handleAccept()}>
            {busy === "accept" ? "Joining…" : "Accept"}
          </Button>
        </div>
      </div>
      <HomeFullDialog open={fullOpen} onOpenChange={setFullOpen} />
    </>
  );
}
