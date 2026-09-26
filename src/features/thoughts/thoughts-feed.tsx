import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock,
  Flame,
  Loader2,
  PenLine,
  RefreshCw,
  Trophy,
  X,
} from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { UserAvatar } from "@/components/common/user-avatar";
import { useAuthSession } from "@/features/auth/api";
import {
  useForYouThoughtsQuery,
  useFreshThoughtsQuery,
  useLazyForYouThoughtsQuery,
  useLazyFreshThoughtsQuery,
  useLazyConnectionsThoughtsQuery,
  useConnectionsThoughtsQuery,
  useLazyMyThoughtsQuery,
  useMyThoughtsQuery,
} from "@/features/thoughts/api";
import { ThoughtCard } from "@/features/thoughts/thought-card";
import { ThoughtComposer } from "@/features/thoughts/thought-composer";
import { ThoughtsSidebar } from "@/features/thoughts/thoughts-sidebar";
import {
  engagementScore,
  topHashtags,
} from "@/features/thoughts/thought-tags";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Thought } from "@/types/domain";
import logoDark from "@/assets/app-logo/HiRotili Logo Dark.png";
import logoLight from "@/assets/app-logo/HiRotoli Logo Light.png";

type FeedTab = "for-you" | "fresh" | "connections" | "mine";
type SortMode = "latest" | "top";

const TABS = [
  { id: "for-you", label: "For you" },
  { id: "fresh", label: "Fresh" },
  { id: "connections", label: "Connections" },
  { id: "mine", label: "Me" },
] as const;



export function ThoughtsFeed() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const sessionProfile = authQuery.data?.profile;
  const [tab, setTab] = useState<FeedTab>("for-you");
  const [older, setOlder] = useState<Thought[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("latest");
  // Pagination state beyond the first page. RTK lazy pages land in their
  // own cache entries, so the cursor/hasMore must be tracked locally —
  // otherwise auto-scroll would re-request the same cursor forever.
  const [nextPage, setNextPage] = useState<{
    cursor: string | null;
    hasMore: boolean;
  } | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const PULL_THRESHOLD = 80;
  const PULL_MAX = 128;

  const fresh = useFreshThoughtsQuery(
    { cursor: null },
    { skip: tab !== "fresh" || !isLoggedIn },
  );
  const forYou = useForYouThoughtsQuery(
    { cursor: null },
    { skip: tab !== "for-you" || !isLoggedIn },
  );
  const mine = useMyThoughtsQuery(
    { cursor: null },
    { skip: tab !== "mine" || !isLoggedIn },
  );
  const connections = useConnectionsThoughtsQuery(
    { cursor: null },
    { skip: tab !== "connections" || !isLoggedIn },
  );
  const [loadFresh] = useLazyFreshThoughtsQuery();
  const [loadForYou] = useLazyForYouThoughtsQuery();
  const [loadMine] = useLazyMyThoughtsQuery();
  const [loadConnections] = useLazyConnectionsThoughtsQuery();

  const active =
    tab === "fresh"
      ? fresh
      : tab === "mine"
        ? mine
        : tab === "connections"
          ? connections
          : forYou;

  useEffect(() => {
    setOlder([]);
    setNextPage(null);
    setFetching(false);
    setActiveTag(null);
  }, [tab, active.data]);

  const initial = useMemo(
    () => active.data?.thoughts ?? [],
    [active.data],
  );
  const items = useMemo(() => {
    const known = new Set(initial.map((thought) => thought.id));
    return [
      ...initial,
      ...older.filter((thought) => !known.has(thought.id)),
    ];
  }, [initial, older]);
  const firstPageInfo = active.data?.pageInfo;
  const hasMore = nextPage ? nextPage.hasMore : (firstPageInfo?.hasMore ?? false);
  const cursor = nextPage ? nextPage.cursor : (firstPageInfo?.nextCursor ?? null);

  // Client-side discovery over everything loaded: hashtag filter and
  // Top/Latest sort. Server pagination is untouched.
  const isFiltering = activeTag !== null;
  const tags = useMemo(() => topHashtags(items, 8), [items]);

  const visible = useMemo(() => {
    const filtered = activeTag
      ? items.filter((thought) =>
          thought.body.toLowerCase().includes(`#${activeTag}`),
        )
      : items;
    if (sort === "top") {
      return [...filtered].sort(
        (a, b) => engagementScore(b) - engagementScore(a),
      );
    }
    return filtered;
  }, [items, activeTag, sort]);

  const spotlight =
    !isFiltering && sort === "latest" && visible.length >= 2
      ? visible.reduce((best, thought) =>
          engagementScore(thought) > engagementScore(best) ? thought : best,
        )
      : null;
  const list = spotlight
    ? visible.filter((thought) => thought.id !== spotlight.id)
    : visible;

  async function loadMore() {
    if (!cursor || !hasMore || fetching || isFiltering) {
      return;
    }

    setFetching(true);
    try {
      const page =
        tab === "fresh"
          ? await loadFresh({ cursor }).unwrap()
          : tab === "mine"
            ? await loadMine({ cursor }).unwrap()
            : tab === "connections"
              ? await loadConnections({ cursor }).unwrap()
              : await loadForYou({ cursor }).unwrap();

      setNextPage({
        cursor: page.pageInfo.nextCursor,
        hasMore: page.pageInfo.hasMore,
      });
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
    } catch {
      // RTK surfaces the error on the lazy result; the sentinel stays
      // mounted so scrolling retries automatically.
    } finally {
      setFetching(false);
    }
  }

  // Infinite auto-scroll: the sentinel sits at the end of the list and
  // pulls the next page before it enters view. Always calls through a ref
  // so the observer never captures a stale closure.
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    if (!hasMore || active.isLoading || active.isError || isFiltering) {
      return;
    }
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreRef.current();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, active.isLoading, active.isError, isFiltering, tab, items.length]);

  function handlePosted() {
    setComposerOpen(false);
    void active.refetch();
  }

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

  // Current scroll offset: body scroll on mobile, feed container on desktop.
  function scrollerTop() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return window.scrollY;
    }
    return scrollRef.current?.scrollTop ?? 0;
  }

  async function refreshFeed() {
    if (refreshing || active.isLoading) {
      return;
    }
    setRefreshing(true);
    setOlder([]);
    setNextPage(null);
    try {
      await active.refetch();
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (event.touches.length === 1) {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    }
  }

  function handleTouchMove(event: React.TouchEvent) {
    const startY = touchStartY.current;
    const currentY = event.touches[0]?.clientY;
    if (startY === null || currentY === undefined || refreshing) {
      return;
    }
    const dy = currentY - startY;
    // Only stretch while pinned to the very top; otherwise let the list scroll.
    if (dy > 0 && scrollerTop() <= 0) {
      setPull(Math.min(dy * 0.5, PULL_MAX));
    } else {
      setPull(0);
    }
  }

  function handleTouchEnd() {
    touchStartY.current = null;
    if (pull >= PULL_THRESHOLD && !refreshing) {
      void refreshFeed();
    } else {
      setPull(0);
    }
  }

  function clearFilters() {
    setActiveTag(null);
  }

  const pullProgress = Math.min(pull / PULL_THRESHOLD, 1);

  return (
    <AppShell>
      {/* AppShell locks <main> to h-full + overflow-hidden on desktop,
          so the feed owns its scroll container (mobile keeps body scroll). */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStartY.current = null;
          setPull(0);
        }}
        className="relative min-h-dvh bg-background lg:h-full lg:overflow-y-auto"
      >
        {/* Ambient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-drift absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
          <div
            className="orb-drift absolute top-40 right-[4%] h-80 w-80 rounded-full bg-[#5B3FF5]/15 blur-3xl"
            style={{ animationDelay: "-4s" }}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1060px] justify-center">
          {/* Timeline column */}
          <div className="min-h-dvh w-full max-w-[640px] lg:min-h-full">
            <header className="sticky top-0 z-10 border-b border-line/70 bg-background/80 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink">
                    Community · live
                  </p>
                  <h1 className="mt-0.5 bg-gradient-to-r from-ink via-ink to-brand-ink bg-clip-text text-[28px] font-extrabold leading-8 tracking-tight text-transparent">
                    Thoughts
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshFeed()}
                  disabled={refreshing || active.isLoading}
                  aria-label="Refresh feed"
                  title="Refresh feed"
                  className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-muted shadow-sm transition hover:text-ink disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      (refreshing || active.isFetching) && "animate-spin",
                    )}
                    aria-hidden
                  />
                </button>
              </div>

              <nav aria-label="Thought feeds" className="flex px-2">
                {TABS.map((option) => {
                  const selected = tab === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTab(option.id)}
                      aria-selected={selected}
                      role="tab"
                      className="relative flex-1 px-2 py-3.5 text-[15px] transition-colors outline-none hover:bg-surface-hover/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                    >
                      <span
                        className={cn(
                          "inline-block pb-1",
                          selected
                            ? "font-bold text-ink"
                            : "font-medium text-ink-muted",
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          aria-hidden
                          className="absolute inset-x-10 bottom-0 h-1 rounded-full bg-brand"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </header>

            {/* Pull-to-refresh emblem (touch): the mark grows as you pull,
                spins while the timeline reloads. */}
            <div
              aria-hidden={!(pull > 0 || refreshing)}
              className="grid place-items-center overflow-hidden transition-[height] duration-150"
              style={{ height: pull > 0 || refreshing ? 64 : 0 }}
            >
              {refreshing ? (
                <Loader2
                  className="h-7 w-7 animate-spin text-brand"
                  aria-hidden
                />
              ) : (
                <>
                  <img
                    src={logoLight}
                    alt=""
                    aria-hidden
                    className="h-8 w-8 object-contain dark:hidden"
                    style={{
                      transform: `scale(${0.5 + pullProgress * 0.5})`,
                      opacity: 0.4 + pullProgress * 0.6,
                    }}
                  />
                  <img
                    src={logoDark}
                    alt=""
                    aria-hidden
                    className="hidden h-8 w-8 object-contain dark:block"
                    style={{
                      transform: `scale(${0.5 + pullProgress * 0.5})`,
                      opacity: 0.4 + pullProgress * 0.6,
                    }}
                  />
                </>
              )}
            </div>
            {refreshing ? (
              <span role="status" className="sr-only">
                Refreshing feed…
              </span>
            ) : null}

            {/* Composer prompt */}
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="mx-4 mt-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-[1.75rem] border border-line bg-surface/80 px-4 py-3.5 text-left shadow-sm backdrop-blur transition-all outline-none hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10 focus-visible:ring-2 focus-visible:ring-brand"
            >
              {sessionProfile ? (
                <UserAvatar user={sessionProfile} size={40} />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink">
                  <PenLine className="h-4 w-4" aria-hidden />
                </span>
              )}
              <span className="text-lg text-ink-subtle">
                What&apos;s happening?
              </span>
            </button>

            {/* Hashtag filter chips */}
            {tags.length > 0 && !active.isLoading ? (
              <div
                aria-label="Filter by hashtag"
                className="flex gap-2 overflow-x-auto px-4 pb-1 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {tags.map(([tag, count]) => {
                  const selected = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(selected ? null : tag)}
                      aria-pressed={selected}
                      className={cn(
                        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-95",
                        selected
                          ? "border-brand bg-brand text-on-brand shadow-md shadow-brand/25"
                          : "border-line bg-surface/80 text-ink-muted backdrop-blur hover:border-brand/40 hover:text-ink",
                      )}
                    >
                      #{tag} · {count}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Sort + result meta */}
            <div className="flex items-center justify-between px-4 pb-1 pt-3">
              <div
                role="group"
                aria-label="Sort thoughts"
                className="flex gap-1 rounded-full border border-line bg-surface/80 p-1 shadow-sm backdrop-blur"
              >
                {(
                  [
                    { id: "latest", label: "Latest", icon: Clock },
                    { id: "top", label: "Top", icon: Flame },
                  ] as const
                ).map((option) => {
                  const Icon = option.icon;
                  const selected = sort === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSort(option.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand",
                        selected
                          ? "bg-ink text-background shadow"
                          : "text-ink-muted hover:text-ink",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {isFiltering ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-full text-[13px] font-semibold text-brand-ink hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Clear ({visible.length})
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-[13px] text-ink-subtle">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                  Live
                </span>
              )}
            </div>

            <div className="grid gap-4 px-4 pb-28 pt-3">
              {active.isLoading ? (
                [1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.75rem] border border-line bg-surface/80 p-5 shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 rounded-full" />
                        <Skeleton className="h-3 w-24 rounded-full" />
                      </div>
                    </div>
                    <Skeleton className="mt-3 h-4 w-full rounded-full" />
                    <Skeleton className="mt-2 h-4 w-2/3 rounded-full" />
                  </div>
                ))
              ) : null}

              {active.isError ? (
                <div className="rounded-[1.75rem] border border-warning bg-warning-soft p-8 text-center shadow-sm">
                  <p className="text-[15px] font-bold text-warning-ink">
                    Something went wrong.
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Thoughts couldn&apos;t load. Pull down or try again.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 rounded-full"
                    onClick={() => void active.refetch()}
                  >
                    Try again
                  </Button>
                </div>
              ) : null}

              {!active.isLoading && !active.isError && visible.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-line-strong bg-surface/80 p-10 text-center shadow-sm backdrop-blur">
                  <p className="text-xl font-extrabold text-ink">
                    {isFiltering
                      ? "No matches"
                      : tab === "mine"
                        ? "Share your first thought"
                        : tab === "connections"
                          ? "No thoughts from connections yet"
                          : "Welcome to Thoughts"}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-muted">
                    {isFiltering
                      ? "Try a different hashtag or clear the filter."
                      : tab === "mine"
                        ? "When you post, it will show up here."
                        : tab === "connections"
                          ? "Thoughts from people you connect with will appear here."
                          : "Be the first to share one with the community."}
                  </p>
                  {isFiltering ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-4 rounded-full"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="mt-5 rounded-full px-6 text-[15px] font-bold"
                      onClick={() => setComposerOpen(true)}
                    >
                      Post a thought
                    </Button>
                  )}
                </div>
              ) : null}

              {spotlight ? (
                <div className="feed-item relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-[#5B3FF5] to-[#06b6d4] p-[2px] shadow-xl shadow-brand/20">
                  <div
                    aria-hidden
                    className="spotlight-sheen pointer-events-none absolute inset-y-0 w-1/3 bg-white/25 blur-xl"
                  />
                  <div className="rounded-[calc(2rem-2px)] bg-surface">
                    <p className="flex items-center gap-2 px-5 pb-0 pt-4 text-[13px] font-extrabold uppercase tracking-wider text-brand-ink">
                      <Trophy className="h-4 w-4" aria-hidden />
                      Top thought
                    </p>
                    <ThoughtCard thought={spotlight} spotlight />
                  </div>
                </div>
              ) : null}

              {list.map((thought, position) => (
                <ThoughtCard
                  key={`${tab}-${thought.id}`}
                  thought={thought}
                  index={position}
                />
              ))}

              {hasMore && !isFiltering ? (
                <div
                  ref={sentinelRef}
                  aria-hidden
                  className="flex justify-center py-4"
                >
                  {fetching ? (
                    <Loader2
                      className="h-6 w-6 animate-spin text-brand"
                      aria-hidden
                    />
                  ) : null}
                </div>
              ) : null}
              {fetching ? (
                <span role="status" className="sr-only">
                  Loading more thoughts…
                </span>
              ) : null}
              {!hasMore && !active.isLoading && visible.length > 0 ? (
                <p className="py-2 text-center text-sm text-ink-subtle">
                  You&apos;re all caught up.
                </p>
              ) : null}
            </div>
          </div>

          <ThoughtsSidebar
            thoughts={items}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
          />
        </div>

        {/* Compose FAB */}
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          aria-label="New thought"
          className="fixed bottom-20 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-brand text-on-brand shadow-xl shadow-brand/30 transition hover:scale-105 hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-95 lg:bottom-8 lg:right-8"
        >
          <PenLine className="h-6 w-6" aria-hidden />
        </button>

        {/* Composer modal */}
        <Dialog
          open={composerOpen}
          onOpenChange={(next) => {
            if (!next) {
              setComposerOpen(false);
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogTitle>New thought</DialogTitle>
            <DialogDescription>
              Share what&apos;s on your mind — up to 1000 characters.
            </DialogDescription>
            <ThoughtComposer onPosted={handlePosted} />
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
