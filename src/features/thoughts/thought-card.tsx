import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeOff,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { HirotoliId } from "@/components/common/hirotoli-id";
import { UserAvatar } from "@/components/common/user-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function ThoughtCard({
  thought,
  index = 0,
  spotlight = false,
}: {
  thought: Thought;
  index?: number;
  spotlight?: boolean;
}) {
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

  function openEditor() {
    setEditBody(thought.body);
    setEditing(true);
    setConfirmingDelete(false);
  }

  async function confirmDelete() {
    await deleteThought(thought.id).unwrap();
    setConfirmingDelete(false);
  }

  function openProfile() {
    if (thought.author.publicUserId) {
      void navigate(`/profile/${thought.author.publicUserId}`);
    }
  }

  if (thought.viewer.hidden) {
    return (
      <article className="rounded-[1.75rem] border border-line bg-surface/80 p-5 shadow-sm backdrop-blur">
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
    <article
      className={
        spotlight
          ? "group px-5 pb-5 pt-1"
          : "feed-item group rounded-[1.75rem] border border-line bg-surface/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10"
      }
      style={spotlight ? undefined : { animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openProfile}
          aria-label={`View ${thought.author.displayName}'s profile`}
          className="shrink-0 rounded-full bg-gradient-to-br from-brand via-[#5B3FF5] to-[#D94FE8] p-[2px] outline-none transition focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="block rounded-full bg-surface p-[2px]">
            <UserAvatar user={thought.author} size={42} />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openProfile}
              className="truncate text-[15px] font-bold text-ink hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {thought.author.displayName}
            </button>
            {thought.author.toli ? (
              <ToliBadge name={thought.author.toli.name} />
            ) : null}
          </p>
          <p className="text-[13px] text-ink-subtle">
            <HirotoliId
              publicUserId={thought.author.publicUserId}
              username={thought.author.username}
            />{" "}
            · {formatThoughtTime(thought.createdAt)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              aria-label="Thought actions"
              className="h-8 w-8 shrink-0 rounded-full text-ink-subtle opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isOwn ? (
              <>
                <DropdownMenuItem
                  onSelect={openEditor}
                  className="cursor-pointer gap-2"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit thought
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setConfirmingDelete(true);
                    setEditing(false);
                  }}
                  className="cursor-pointer gap-2 text-danger-ink focus:text-danger-ink"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete thought
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  onSelect={() => void hide(thought.id)}
                  className="cursor-pointer gap-2"
                >
                  <EyeOff className="h-4 w-4" aria-hidden />
                  Hide thought
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setReporting(true);
                    setConfirmingDelete(false);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Flag className="h-4 w-4" aria-hidden />
                  Report thought
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 break-words text-[15px] leading-7 text-ink">
        {thought.body}
      </p>

      {editing ? (
        <div className="mt-3 grid gap-2 rounded-2xl bg-surface-muted p-3">
          <Textarea
            value={editBody}
            maxLength={1000}
            rows={3}
            aria-label="Edit thought"
            onChange={(event) => setEditBody(event.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || !editBody.trim()}
              onClick={() => void saveEdit()}
              className="rounded-full"
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
              className="rounded-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {confirmingDelete ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-danger bg-danger-soft p-3">
          <p className="text-sm font-medium text-danger-ink">
            Delete this thought forever?
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full"
            >
              Keep
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => void confirmDelete()}
              className="rounded-full"
            >
              {deleteState.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-2.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void toggleLike()}
          aria-label={thought.viewer.liked ? "Unlike thought" : "Like thought"}
          className={cn(
            "gap-1.5 rounded-full px-3 text-ink-subtle transition-all hover:bg-danger-soft hover:text-danger-ink active:scale-95",
            thought.viewer.liked && "bg-danger-soft text-danger-ink",
          )}
        >
          <Heart
            className={cn("h-[18px] w-[18px]", thought.viewer.liked && "fill-current")}
            aria-hidden
          />
          <span className="text-[13px] font-semibold">{thought.counts.likes}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          asChild
          aria-label={`Open comments, ${thought.counts.comments} replies`}
          className="gap-1.5 rounded-full px-3 text-ink-subtle transition-all hover:bg-brand-soft hover:text-brand-ink active:scale-95"
        >
          <Link to={`/thoughts/${thought.id}`}>
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
            <span className="text-[13px] font-semibold">{thought.counts.comments}</span>
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void toggleShare()}
          aria-label={thought.viewer.shared ? "Unshare thought" : "Share thought"}
          className={cn(
            "gap-1.5 rounded-full px-3 text-ink-subtle transition-all hover:bg-success-soft hover:text-success-ink active:scale-95",
            thought.viewer.shared && "bg-success-soft text-success-ink",
          )}
        >
          <Share2
            className={cn("h-[18px] w-[18px]", thought.viewer.shared && "fill-current")}
            aria-hidden
          />
          <span className="text-[13px] font-semibold">{thought.counts.shares}</span>
        </Button>
      </div>

      {reporting && !reported ? (
        <div className="mt-3 grid gap-2 rounded-2xl bg-surface-muted p-3">
          <div className="flex items-center gap-2">
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-9 flex-1 rounded-full border border-line bg-surface px-3 text-sm text-ink"
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
              className="rounded-full"
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
