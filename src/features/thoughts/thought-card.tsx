import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeOff,
  Flag,
  Heart,
  MessageCircle,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { SenderAvatar } from "@/components/common/sender-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatThoughtTime } from "@/lib/thought-time";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/features/auth/api";
import {
  useDeleteThoughtMutation,
  useHideThoughtMutation,
  useLikeThoughtMutation,
  useReportThoughtMutation,
  useShareThoughtMutation,
  useUnhideThoughtMutation,
  useUnlikeThoughtMutation,
  useUnshareThoughtMutation,
  useUpdateThoughtMutation,
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
  const authQuery = useAuthSession();
  const isOwn = Boolean(
    authQuery.data?.user?.id &&
      authQuery.data.user.id === thought.author.userId,
  );
  const [like, likeState] = useLikeThoughtMutation();
  const [unlike, unlikeState] = useUnlikeThoughtMutation();
  const [share, shareState] = useShareThoughtMutation();
  const [unshare, unshareState] = useUnshareThoughtMutation();
  const [hide, hideState] = useHideThoughtMutation();
  const [unhide, unhideState] = useUnhideThoughtMutation();
  const [report, reportState] = useReportThoughtMutation();
  const [updateThought, updateState] = useUpdateThoughtMutation();
  const [deleteThought, deleteState] = useDeleteThoughtMutation();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [reported, setReported] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(thought.body);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const busy =
    likeState.isLoading ||
    unlikeState.isLoading ||
    shareState.isLoading ||
    unshareState.isLoading ||
    hideState.isLoading ||
    unhideState.isLoading ||
    reportState.isLoading ||
    updateState.isLoading ||
    deleteState.isLoading;

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

  async function toggleShare() {
    if (busy) {
      return;
    }

    if (thought.viewer.shared) {
      await unshare(thought.id);
    } else {
      await share(thought.id);
    }
  }

  async function submitReport() {
    if (isOwn) {
      return;
    }
    await report({
      id: thought.id,
      reason,
      details: details.trim() ? details.trim() : undefined,
    });
    setReported(true);
    setReporting(false);
  }

  async function saveEdit() {
    const body = editBody.trim();
    if (!body || busy) {
      return;
    }
    await updateThought({ id: thought.id, body }).unwrap();
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    await deleteThought(thought.id).unwrap();
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

      {editing ? (
        <div className="mt-3 grid gap-2">
          <Textarea
            value={editBody}
            maxLength={1000}
            rows={3}
            onChange={(event) => setEditBody(event.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || !editBody.trim()}
              onClick={() => void saveEdit()}
            >
              {updateState.isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setEditBody(thought.body);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

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
          disabled={busy}
          onClick={() => void toggleShare()}
          aria-label={thought.viewer.shared ? "Unshare" : "Share"}
          className={cn("gap-1.5", thought.viewer.shared && "text-brand")}
        >
          <Share2
            className={cn("h-4 w-4", thought.viewer.shared && "fill-current")}
            aria-hidden
          />
          {thought.counts.shares}
        </Button>
        <span className="flex-1" />
        {isOwn ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setEditBody(thought.body);
                setEditing((current) => !current);
              }}
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void handleDelete()}
              onBlur={() => setConfirmingDelete(false)}
              aria-label={confirmingDelete ? "Confirm delete" : "Delete"}
              className={cn(confirmingDelete && "text-danger-ink")}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {confirmingDelete ? "Sure?" : ""}
            </Button>
          </>
        ) : null}
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
        {!isOwn ? (
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
        ) : null}
      </div>

      {reporting && !reported ? (
        <div className="mt-2 grid gap-2 rounded-xl bg-surface-muted p-2">
          <div className="flex items-center gap-2">
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
          <Textarea
            value={details}
            maxLength={500}
            rows={2}
            placeholder="Details (optional)"
            onChange={(event) => setDetails(event.target.value)}
          />
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
