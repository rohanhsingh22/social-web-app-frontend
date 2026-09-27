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
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { NotificationRow } from "@/components/common/notification-row";
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
  const [markingId, setMarkingId] = useState<string | null>(null);

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
    // Guard rapid double-clicks: one in-flight mark per notification.
    if (!notification.readAt && markingId !== notification.id) {
      setMarkingId(notification.id);
      try {
        await markRead(notification.id).unwrap();
      } catch {
        // Read state converges on the next poll; navigation still proceeds.
      } finally {
        setMarkingId((current) =>
          current === notification.id ? null : current,
        );
      }
    }

    const destination = destinationFor(notification);

    if (destination) {
      navigate(destination);
    }
  }

  return (
    <AppShell>
      <section className="page-container max-w-2xl">
        <PageHeader
          title="Notifications"
          subtitle="Connection requests, messages, and notices."
          action={
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
          }
        />
        {unreadCount > 0 ? (
          <p className="mt-2 text-sm text-ink-muted" role="status">
            {unreadCount} unread
          </p>
        ) : null}

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
            <ErrorState
              message="Notifications are not reachable right now. Please try again."
              onRetry={() => void listQuery.refetch()}
            />
          ) : null}

          {!listQuery.isLoading && !listQuery.isError && items.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="You are all caught up"
              message="Connection requests, new messages, and notices will appear here."
            />
          ) : null}

          {items.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              unread={!notification.readAt}
              onClick={() => void openNotification(notification)}
              canNavigate={Boolean(destinationFor(notification))}
            />
          ))}

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
