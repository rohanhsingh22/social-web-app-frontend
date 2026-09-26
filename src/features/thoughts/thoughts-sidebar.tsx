import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Heart, Lightbulb, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HirotoliId } from "@/components/common/hirotoli-id";
import { UserAvatar } from "@/components/common/user-avatar";
import { useAuthSession } from "@/features/auth/api";
import { useMyThoughtsQuery } from "@/features/thoughts/api";
import { topHashtags } from "@/features/thoughts/thought-tags";
import { cn } from "@/lib/utils";
import type { Thought } from "@/types/domain";

type SidebarProps = {
  thoughts: Thought[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
};

function TrendingCard({ thoughts, activeTag, onSelectTag }: SidebarProps) {
  const tags = useMemo(() => topHashtags(thoughts), [thoughts]);

  return (
    <section
      aria-label="Trending topics"
      className="overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <h2 className="flex items-center gap-2 px-5 pb-1 pt-5 text-xl font-extrabold text-ink">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-on-brand">
          <Flame className="h-4 w-4" aria-hidden />
        </span>
        Trending
      </h2>
      {tags.length === 0 ? (
        <p className="px-5 py-4 text-sm text-ink-muted">
          Hashtags people use will trend here. Be the first to start one.
        </p>
      ) : (
        <ul className="pb-2">
          {tags.map(([tag, count]) => {
            const selected = activeTag === tag;
            return (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => onSelectTag(selected ? null : tag)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left transition-colors outline-none hover:bg-surface-hover/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
                    selected && "bg-brand-soft/60",
                  )}
                >
                  <span>
                    <span
                      className={cn(
                        "block truncate text-[15px] font-bold",
                        selected ? "text-brand-ink" : "text-ink",
                      )}
                    >
                      #{tag}
                    </span>
                    <span className="block text-[13px] text-ink-subtle">
                      {count} {count === 1 ? "thought" : "thoughts"}
                    </span>
                  </span>
                  {selected ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function TopAuthorsCard({ thoughts }: { thoughts: Thought[] }) {
  const navigate = useNavigate();
  const authors = useMemo(() => {
    const byId = new Map<
      string,
      { author: Thought["author"]; count: number; likes: number }
    >();
    for (const thought of thoughts) {
      const entry = byId.get(thought.author.userId) ?? {
        author: thought.author,
        count: 0,
        likes: 0,
      };
      entry.count += 1;
      entry.likes += thought.counts.likes;
      byId.set(thought.author.userId, entry);
    }
    return [...byId.values()]
      .sort((a, b) => b.count - a.count || b.likes - a.likes)
      .slice(0, 5);
  }, [thoughts]);

  if (authors.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Top authors"
      className="overflow-hidden rounded-2xl border border-line bg-surface"
      style={{ animationDelay: "80ms" }}
    >
      <h2 className="px-5 pb-1 pt-5 text-xl font-extrabold text-ink">
        Top voices
      </h2>
      <ul className="pb-2">
        {authors.map(({ author, count }) => (
          <li key={author.userId}>
            <button
              type="button"
              onClick={() => {
                if (author.publicUserId) {
                  void navigate(`/profile/${author.publicUserId}`);
                }
              }}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors outline-none hover:bg-surface-hover/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
            >
              <UserAvatar user={author} size={40} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-ink">
                  {author.displayName}
                </span>
                <HirotoliId
                  publicUserId={author.publicUserId}
                  username={author.username}
                  className="block truncate text-[13px] text-ink-subtle"
                />
              </span>
              <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-ink-muted">
                {count} {count === 1 ? "post" : "posts"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityCard() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const mine = useMyThoughtsQuery(
    { cursor: null },
    { skip: !isLoggedIn },
  );

  const thoughts = mine.data?.thoughts ?? [];
  const likes = thoughts.reduce((sum, thought) => sum + thought.counts.likes, 0);
  const shares = thoughts.reduce(
    (sum, thought) => sum + thought.counts.shares,
    0,
  );

  const rows = [
    {
      icon: Lightbulb,
      tile: "bg-brand-soft text-brand-ink",
      value: thoughts.length,
      label: "thoughts shared",
    },
    {
      icon: Heart,
      tile: "bg-danger-soft text-danger-ink",
      value: likes,
      label: "likes received",
    },
    {
      icon: Share2,
      tile: "bg-success-soft text-success-ink",
      value: shares,
      label: "shares received",
    },
  ];

  return (
    <section
      aria-label="Your activity"
      className="overflow-hidden rounded-2xl border border-line bg-surface"
      style={{ animationDelay: "140ms" }}
    >
      <h2 className="px-5 pb-1 pt-5 text-xl font-extrabold text-ink">
        Your activity
      </h2>
      {mine.isLoading ? (
        <div className="space-y-2 px-5 py-4">
          <Skeleton className="h-4 w-2/3 rounded-full" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
        </div>
      ) : (
        <ul className="px-5 py-3">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <li
                key={row.label}
                className="flex items-center gap-3 py-1.5 text-[15px] text-ink"
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full ${row.tile}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-extrabold">{row.value}</span>
                <span className="text-ink-muted">{row.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ThoughtsSidebar(props: SidebarProps) {
  return (
    <aside className="hidden w-[350px] shrink-0 xl:block">
      <div className="sticky top-0 grid max-h-dvh gap-4 overflow-y-auto px-6 py-4">
        <TrendingCard {...props} />
        <TopAuthorsCard thoughts={props.thoughts} />
        <ActivityCard />
        <nav
          aria-label="About"
          className="flex flex-wrap gap-x-3 gap-y-1 px-5 text-[13px] text-ink-subtle"
        >
          <span>Terms</span>
          <span>Privacy</span>
          <span>Community guidelines</span>
          <span>© 2026 HiRotoli</span>
        </nav>
        <div className="h-20" aria-hidden />
      </div>
    </aside>
  );
}
