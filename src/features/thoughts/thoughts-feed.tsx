import { useEffect, useState } from "react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import {
  useForYouThoughtsQuery,
  useFreshThoughtsQuery,
  useLazyForYouThoughtsQuery,
  useLazyFreshThoughtsQuery,
} from "@/features/thoughts/api";
import { ThoughtCard } from "@/features/thoughts/thought-card";
import { ThoughtComposer } from "@/features/thoughts/thought-composer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Thought } from "@/types/domain";

type FeedTab = "for-you" | "fresh";

export function ThoughtsFeed() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const [tab, setTab] = useState<FeedTab>("for-you");
  const [older, setOlder] = useState<Thought[]>([]);

  const fresh = useFreshThoughtsQuery(
    { cursor: null },
    { skip: tab !== "fresh" || !isLoggedIn },
  );
  const forYou = useForYouThoughtsQuery(
    { cursor: null },
    { skip: tab !== "for-you" || !isLoggedIn },
  );
  const [loadFresh, freshMore] = useLazyFreshThoughtsQuery();
  const [loadForYou, forYouMore] = useLazyForYouThoughtsQuery();

  useEffect(() => {
    setOlder([]);
  }, [tab]);

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Login to read thoughts, share your own, and join the conversation."
        />
      </AppShell>
    );
  }

  const active = tab === "fresh" ? fresh : forYou;
  const loadingMore = freshMore.isFetching || forYouMore.isFetching;
  const initial = active.data?.thoughts ?? [];
  const known = new Set(initial.map((thought) => thought.id));
  const items = [...initial, ...older.filter((thought) => !known.has(thought.id))];
  const pageInfo = active.data?.pageInfo;

  async function loadMore() {
    const cursor = active.data?.pageInfo.nextCursor;

    if (!cursor || loadingMore) {
      return;
    }

    const page =
      tab === "fresh"
        ? await loadFresh({ cursor }).unwrap()
        : await loadForYou({ cursor }).unwrap();

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

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-ink">Thoughts</h1>

        <div className="mt-4">
          <ThoughtComposer
            onPosted={() => {
              void active.refetch();
            }}
          />
        </div>

        <div className="mt-4 flex gap-2">
          {(
            [
              { id: "for-you", label: "For You" },
              { id: "fresh", label: "Fresh" },
            ] as const
          ).map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={tab === option.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(option.id)}
              className={cn(tab === option.id && "font-semibold")}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          {active.isLoading ? (
            [1, 2, 3].map((item) => (
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
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))
          ) : null}

          {active.isError ? (
            <p className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-warning-ink">
              Thoughts are not reachable right now. Please try again.
            </p>
          ) : null}

          {!active.isLoading && items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-surface-muted p-8 text-center text-sm text-ink-muted">
              No thoughts yet. Be the first to share one.
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
      </section>
    </AppShell>
  );
}
