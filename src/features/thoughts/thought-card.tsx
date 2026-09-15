import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeOff,
  Flag,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { SenderAvatar } from "@/components/common/sender-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";
import { Button } from "@/components/ui/button";
import { formatThoughtTime } from "@/lib/thought-time";
import { cn } from "@/lib/utils";
import {
  useHideThoughtMutation,
  useLikeThoughtMutation,
  useReportThoughtMutation,
  useShareThoughtMutation,
  useUnhideThoughtMutation,
  useUnlikeThoughtMutation,
} from "@/features/thoughts/api";
import type { Thought } from "@/types/domain";

const REPORT_REASONS = [
  "spam",
  "harassment",
  "hate_or_abuse",
  "sexual_content",
  "fake_profile",
  "underage_safety",
  "other",
] as const;

export function ThoughtCard({ thought }: { thought: Thought }) {
  const navigate = useNavigate();
  const [like, likeState] = useLikeThoughtMutation();
  const [unlike, unlikeState] = useUnlikeThoughtMutation();
  const [share, shareState] = useShareThoughtMutation();
  const [hide, hideState] = useHideThoughtMutation();
  const [unhide, unhideState] = useUnhideThoughtMutation();
  const [report, reportState] = useReportThoughtMutation();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [reported, setReported] = useState(false);

  const busy =
    likeState.isLoading ||
    unlikeState.isLoading ||
    shareState.isLoading ||
    hideState.isLoading ||
    unhideState.isLoading ||
    reportState.isLoading;

  async function toggleLike() {
    if (busy) {
      return;
    }

    if (thought.viewer.liked) {
      await unlike(thought.id);
    } else {
      await like(thought.id);
    }
  }

  async function submitReport() {
    await report({ id: thought.id, reason });
    setReported(true);
    setReporting(false);
  }

  if (thought.viewer.hidden) {
    return (
      <article className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-ink-muted">
          You hid this thought.{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() => void unhide(thought.id)}
            className="font-semibold text-brand hover:underline disabled:opacity-50"
          >
            Undo
          </button>
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (thought.author.publicUserId) {
              void navigate(`/profile/${thought.author.publicUserId}`);
            }
          }}
          aria-label={`View ${thought.author.displayName}'s profile`}
        >
          <SenderAvatar sender={thought.author} size={40} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">
              {thought.author.displayName}
            </span>
            {thought.author.toli ? (
              <ToliBadge name={thought.author.toli.name} />
            ) : null}
          </p>
          <p className="text-xs text-ink-subtle">
            @{thought.author.username} · {formatThoughtTime(thought.createdAt)}
          </p>
        </div>
      </div>

      <p className="mt-3 break-words text-sm leading-6 text-ink">
        {thought.body}
      </p>

      <div className="mt-3 flex items-center gap-1 border-t border-line pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void toggleLike()}
          aria-label={thought.viewer.liked ? "Unlike" : "Like"}
          className={cn(
            "gap-1.5",
            thought.viewer.liked && "text-rose-600",
          )}
        >
          <Heart
            className={cn("h-4 w-4", thought.viewer.liked && "fill-current")}
            aria-hidden
          />
          {thought.counts.likes}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5"
        >
          <Link to={`/thoughts/${thought.id}`} aria-label="Open comments">
            <MessageCircle className="h-4 w-4" aria-hidden />
            {thought.counts.comments}
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy || thought.viewer.shared}
          onClick={() => void share(thought.id)}
          aria-label="Share"
          className="gap-1.5"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          {thought.counts.shares}
        </Button>
        <span className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void hide(thought.id)}
          aria-label="Hide"
        >
          <EyeOff className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => setReporting((current) => !current)}
          aria-label="Report"
        >
          <Flag className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {reporting && !reported ? (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-surface-muted p-2">
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-9 flex-1 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
            aria-label="Report reason"
          >
            {REPORT_REASONS.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => void submitReport()}
          >
            Report
          </Button>
        </div>
      ) : null}
      {reported ? (
        <p className="mt-2 text-xs text-ink-muted">
          Thanks — our moderators will review this thought.
        </p>
      ) : null}
    </article>
  );
}
