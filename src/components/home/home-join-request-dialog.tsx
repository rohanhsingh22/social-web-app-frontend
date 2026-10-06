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
import type { HomeJoinRequest } from "@/types/domain";

// Incoming join-request popup (Phase 14): whoever the requester discovered
// the Home through decides. Same 20s visual countdown, no room terminology.
export function HomeJoinRequestDialog({
  joinRequest,
  onDone,
}: {
  joinRequest: HomeJoinRequest;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const actions = useHomeActions();
  const { data: connections = [] } = useHomeConnections(true);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    remainingSeconds(joinRequest.expiresAt),
  );
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const [fullOpen, setFullOpen] = useState(false);
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);

  const requesterName =
    connections.find((c) => c.userId === joinRequest.requesterId)
      ?.displayName ?? "Someone";

  useEffect(() => {
    setSecondsLeft(remainingSeconds(joinRequest.expiresAt));
    setFailedCode(null);
    setFullOpen(false);
    setBusy(null);
  }, [joinRequest.id, joinRequest.expiresAt]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDone();
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft(remainingSeconds(joinRequest.expiresAt));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [joinRequest.expiresAt, secondsLeft, onDone]);

  async function handleAccept() {
    setBusy("accept");
    setFailedCode(null);
    try {
      await actions.acceptJoinRequest(joinRequest.id).unwrap();
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
      await actions.rejectJoinRequest(joinRequest.id).unwrap();
    } catch (error) {
      const code = getHomeErrorCode(error);
      if (code !== "JOIN_REQUEST_EXPIRED") {
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
        aria-label={`Join request from ${requesterName}`}
        aria-describedby="home-join-request-countdown"
        className="fixed inset-x-4 bottom-20 z-50 mx-auto w-full max-w-sm rounded-3xl border border-line bg-surface p-4 shadow-xl sm:inset-x-auto sm:bottom-8 sm:right-8 sm:mx-0"
      >
        <p className="text-sm text-ink">
          <span className="font-semibold">{requesterName}</span> wants to join
          your Home
        </p>
        <p
          id="home-join-request-countdown"
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
            {busy === "accept" ? "Adding…" : "Accept"}
          </Button>
        </div>
      </div>
      <HomeFullDialog open={fullOpen} onOpenChange={setFullOpen} />
    </>
  );
}
