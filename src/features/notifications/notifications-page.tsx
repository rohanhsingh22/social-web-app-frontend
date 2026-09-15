import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import {
  useLazyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/domain";

function destinationFor(notification: Notification): string | null {
  const metadata = notification.metadata ?? {};

  if (notification.type === "new_dm") {
    const conversationId = metadata.conversationId;
    return typeof conversationId === "string" && conversationId
      ? `/connections/${conversationId}`
      : "/messages";
  }

  if (
    notification.type === "connection_request" ||
    notification.type === "connection_accepted"
  ) {
    return "/connections";
  }

  return null;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const [older, setOlder] = useState<Notification[]>([]);

  const listQuery = useNotificationsQuery(
    { cursor: null },
    { skip: !isLoggedIn },
  );
  const [loadMore, loadMoreState] = useLazyNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, markAllState] = useMarkNotificationsReadMutation();

  useEffect(() => {
    setOlder([]);
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Login to see connection requests, messages, and notices."
        />
      </AppShell>
    );
  }

  const initial = listQuery.data?.notifications ?? [];
  const known = new Set(initial.map((item) => item.id));
  const items = [...initial, ...older.filter((item) => !known.has(item.id))];
  const pageInfo = listQuery.data?.pageInfo;
  const unreadCount = listQuery.data?.unreadCount ?? 0;

  async function handleLoadMore() {
    const cursor = pageInfo?.nextCursor;

    if (!cursor || loadMoreState.isFetching) {
      return;
    }

    const page = await loadMore({ cursor }).unwrap();
    setOlder((current) => {
      const ids = new Set([
        ...current.map((item) => item.id),
        ...initial.map((item) => item.id),
      ]);
      return [
        ...current,
        ...page.notifications.filter((item) => !ids.has(item.id)),
      ];
    });
  }

  async function openNotification(notification: Notification) {
    if (!notification.readAt) {
      await markRead(notification.id);
    }

    const destination = destinationFor(notification);

    if (destination) {
      navigate(destination);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <Bell className="h-6 w-6" aria-hidden />
            Notifications
            {unreadCount > 0 ? (
              <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={unreadCount === 0 || markAllState.isLoading}
            onClick={() => void markAllRead({})}
          >
            <CheckCheck className="mr-1 h-4 w-4" aria-hidden />
            Mark all read
          </Button>
        </div>

        <div className="mt-4 grid gap-2">
          {listQuery.isLoading ? (
            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))
          ) : null}

          {listQuery.isError ? (
            <p className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-warning-ink">
              Notifications are not reachable right now. Please try again.
            </p>
          ) : null}

          {!listQuery.isLoading && items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-surface-muted p-8 text-center text-sm text-ink-muted">
              You are all caught up.
            </p>
          ) : null}

          {items.map((notification) => {
            const unread = !notification.readAt;
            const destination = destinationFor(notification);
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => void openNotification(notification)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors hover:bg-surface-hover",
                  unread
                    ? "border-brand bg-brand-soft/40"
                    : "border-line bg-surface",
                )}
              >
                <span className="flex items-center gap-2">
                  {unread ? (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-brand"
                      aria-label="Unread"
                    />
                  ) : null}
                  <span className="flex-1 truncate text-sm font-semibold text-ink">
                    {notification.title}
                  </span>
                </span>
                {notification.body ? (
                  <span className="mt-1 block break-words text-sm text-ink-muted">
                    {notification.body}
                  </span>
                ) : null}
                <span className="mt-1 block text-xs text-ink-subtle">
                  {notification.createdAt
                    ? new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(notification.createdAt))
                    : ""}
                  {destination ? (
                    <span>
                      {" · "}
                      <span className="font-medium text-brand">Open →</span>
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}

          {pageInfo?.hasMore ? (
            <Button
              type="button"
              variant="outline"
              disabled={loadMoreState.isFetching}
              onClick={() => void handleLoadMore()}
            >
              {loadMoreState.isFetching ? "Loading..." : "Load more"}
            </Button>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
