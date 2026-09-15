import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import {
  useCreateThoughtCommentMutation,
  useThought,
  useThoughtCommentsQuery,
} from "@/features/thoughts/api";
import { ThoughtCard } from "@/features/thoughts/thought-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SenderAvatar } from "@/components/common/sender-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";
import { formatThoughtTime } from "@/lib/thought-time";
import { skipToken } from "@reduxjs/toolkit/query";

const MAX_LENGTH = 500;

export function ThoughtThread() {
  const { id } = useParams<{ id: string }>();
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const thoughtQuery = useThought(id, isLoggedIn);
  const commentsQuery = useThoughtCommentsQuery(
    id && isLoggedIn ? { id, cursor: null } : skipToken,
  );
  const [createComment, createState] = useCreateThoughtCommentMutation();
  const [body, setBody] = useState("");

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Login to read thoughts and join the conversation."
        />
      </AppShell>
    );
  }

  const thought = thoughtQuery.data ?? undefined;
  const trimmed = body.trim();
  const valid = trimmed.length > 0 && trimmed.length <= MAX_LENGTH;

  async function submitComment() {
    if (!id || !valid || createState.isLoading) {
      return;
    }

    await createComment({ id, body: trimmed }).unwrap();
    setBody("");
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-6">
        <Link
          to="/thoughts"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All thoughts
        </Link>

        <div className="mt-4 grid gap-3">
          {thoughtQuery.isLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : null}
          {thoughtQuery.isError || (!thoughtQuery.isLoading && !thought) ? (
            <p className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-warning-ink">
              This thought could not be found.
            </p>
          ) : null}
          {thought ? <ThoughtCard thought={thought} /> : null}
        </div>

        {thought ? (
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={MAX_LENGTH}
              rows={2}
              placeholder="Write a comment..."
              aria-label="New comment"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-subtle">
                {trimmed.length}/{MAX_LENGTH}
              </span>
              <Button
                type="button"
                size="sm"
                disabled={!valid || createState.isLoading}
                onClick={() => void submitComment()}
              >
                {createState.isLoading ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          {commentsQuery.data?.comments.map((comment) => (
            <article
              key={comment.id}
              className="flex gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <SenderAvatar sender={comment.author} size={32} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-ink">
                    {comment.author.displayName}
                  </span>
                  {comment.author.toli ? (
                    <ToliBadge name={comment.author.toli.name} />
                  ) : null}{" "}
                  <span className="text-xs text-ink-subtle">
                    {formatThoughtTime(comment.createdAt)}
                  </span>
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-ink-muted">
                  {comment.body}
                </p>
              </div>
            </article>
          ))}
          {commentsQuery.data && commentsQuery.data.comments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-surface-muted p-6 text-center text-sm text-ink-muted">
              No comments yet.
            </p>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
