import { useState } from "react";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/features/auth/api";
import { useHome } from "@/features/home/use-home";
import {
  getHomeErrorCode,
  useHomeActions,
} from "@/features/home/use-home-actions";
import { homeErrorMessage } from "@/features/home/home-errors";
import { useHomeVoiceContext } from "@/features/home/voice/use-home-voice-context";
import type { HomeMember } from "@/types/domain";

// Minimal Home controls (spec #83): mute, speaker, leave — plus owner-only
// removal. No room ids, servers, or connection internals surface here.
export function HomeControls() {
  const voice = useHomeVoiceContext();
  const { home } = useHome();
  const authQuery = useAuthSession();
  const userId = authQuery.data?.user.id;
  const actions = useHomeActions();
  const [actionError, setActionError] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<HomeMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const myRole = home?.members.find((m) => m.userId === userId)?.role;
  const isOwner = myRole === "OWNER";
  const removable =
    home?.members.filter((m) => m.userId !== userId) ?? [];
  const voiceFailed =
    voice.connectionState === "disconnected" && voice.error !== null;

  async function handleLeave() {
    setLeaving(true);
    setActionError(null);
    try {
      await actions.leaveHome(undefined).unwrap();
      await voice.disconnect();
      setLeaveOpen(false);
    } catch (error) {
      setActionError(getHomeErrorCode(error));
    } finally {
      setLeaving(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget) {
      return;
    }

    setRemoving(true);
    setActionError(null);
    try {
      await actions.removeMember(removeTarget.userId).unwrap();
      setRemoveTarget(null);
    } catch (error) {
      setActionError(getHomeErrorCode(error));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {voice.error && (
        <p role="alert" className="text-center text-xs text-danger-ink">
          {homeErrorMessage(voice.error)}{" "}
          {voiceFailed && (
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => voice.retry()}
            >
              Retry
            </button>
          )}
        </p>
      )}
      {actionError !== null && (
        <p role="alert" className="text-center text-xs text-danger-ink">
          {homeErrorMessage(actionError)}
        </p>
      )}
      <div className="flex items-center justify-center gap-2">
        <Button
          size="icon"
          variant={voice.isMuted ? "destructive" : "outline"}
          aria-label={voice.isMuted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={!voice.isMuted}
          onClick={() => voice.toggleMute()}
        >
          {voice.isMuted ? (
            <MicOff className="h-4 w-4" aria-hidden />
          ) : (
            <Mic className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          aria-label={voice.isSpeakerEnabled ? "Mute speaker" : "Enable speaker"}
          aria-pressed={voice.isSpeakerEnabled}
          onClick={() => voice.toggleSpeaker()}
        >
          {voice.isSpeakerEnabled ? (
            <Volume2 className="h-4 w-4" aria-hidden />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          aria-label="Leave Home"
          onClick={() => setLeaveOpen(true)}
        >
          <PhoneOff className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <p className="text-center text-xs text-ink-subtle" aria-live="polite">
        {voice.connectionState === "connected"
          ? "Voice connected"
          : voice.connectionState === "connecting" || voice.rejoining
            ? "Connecting voice…"
            : voice.connectionState === "reconnecting"
              ? "Reconnecting…"
              : "Voice disconnected"}
      </p>
      {isOwner && removable.length > 0 && (
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-line bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Members
          </p>
          <ul className="mt-1 divide-y divide-line">
            {removable.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-2 py-1.5"
              >
                <span className="truncate text-sm text-ink">
                  {member.displayName}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove ${member.displayName} from Home`}
                  onClick={() => setRemoveTarget(member)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Leave Home?"
        description={
          isOwner
            ? "Leaving as the owner ends this Home for everyone."
            : "You will leave this Home."
        }
        confirmLabel="Leave"
        destructive
        confirming={leaving}
        onConfirm={() => void handleLeave()}
      />
      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveTarget(null);
          }
        }}
        title={`Remove ${removeTarget?.displayName ?? "member"}?`}
        description="They will leave the Home immediately."
        confirmLabel="Remove"
        destructive
        confirming={removing}
        onConfirm={() => void handleRemove()}
      />
    </div>
  );
}
