import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useLazyMyThoughtsQuery,
  useLazyThoughtsByUserQuery,
  useMyThoughtsQuery,
  useThoughtsByUserQuery,
} from "@/features/thoughts/api";
import { ThoughtCard } from "@/features/thoughts/thought-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Thought } from "@/types/domain";

type UserThoughtsProps = {
  publicUserId?: string;
  isOwn: boolean;
  title?: string;
};

export function UserThoughts({
  publicUserId,
  isOwn,
  title,
}: UserThoughtsProps) {
  const [older, setOlder] = useState<Thought[]>([]);
  const resetKey = isOwn ? "mine" : (publicUserId ?? "unknown");

  const mineQuery = useMyThoughtsQuery(
    { cursor: null },
    { skip: !isOwn },
  );
  const byUserQuery = useThoughtsByUserQuery(
    !isOwn && publicUserId ? { publicUserId, cursor: null } : skipToken,
  );
  const [loadMine, mineMore] = useLazyMyThoughtsQuery();
  const [loadByUser, byUserMore] = useLazyThoughtsByUserQuery();

  useEffect(() => {
    setOlder([]);
  }, [resetKey]);

  const active = isOwn ? mineQuery : byUserQuery;
  const loadingMore = mineMore.isFetching || byUserMore.isFetching;
  const initial = active.data?.thoughts ?? [];
  const known = new Set(initial.map((thought) => thought.id));
  const items = [
    ...initial,
    ...older.filter((thought) => !known.has(thought.id)),
  ];
  const pageInfo = active.data?.pageInfo;

  async function loadMore() {
    const cursor = active.data?.pageInfo.nextCursor;

    if (!cursor || loadingMore) {
      return;
    }

    const page = isOwn
      ? await loadMine({ cursor }).unwrap()
      : await loadByUser({
          publicUserId: publicUserId ?? "",
          cursor,
        }).unwrap();

    setOlder((current) => {
      const ids = new Set([
        ...current.map((thought) => thought.id),
        ...initial.map((thought) => thought.id),
      ]);
      return [
        ...current,
        ...page.thoughts.filter((thought) => !ids.has(thought.id)),
      ];
    });
  }

  if (!isOwn && !publicUserId) {
    return null;
  }

  return (
    <div className="rounded-xl border border-line bg-background/40 p-4 lg:p-5">
      <h2 className="font-semibold text-ink">
        {title ?? (isOwn ? "Your Thoughts" : "Thoughts")}
      </h2>

      {/* Profile page locks ancestors to overflow-hidden, so this list
          scrolls internally instead of growing the page. */}
      <div className="chat-scrollbar mt-3 grid max-h-[480px] gap-3 overflow-y-auto pr-1">
        {active.isLoading ? (
          [1, 2].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))
        ) : null}

        {active.isError ? (
          <p className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-warning-ink">
            Thoughts are not reachable right now. Please try again.
          </p>
        ) : null}

        {!active.isLoading && !active.isError && items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong bg-surface-muted p-6 text-center text-sm text-ink-muted">
            {isOwn
              ? "You haven't shared any thoughts yet."
              : "No thoughts yet."}
          </p>
        ) : null}

        {items.map((thought) => (
          <ThoughtCard key={thought.id} thought={thought} />
        ))}

        {pageInfo?.hasMore ? (
          <Button
            type="button"
            variant="outline"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
