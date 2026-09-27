import { cn } from "@/lib/utils";
import type { Notification } from "@/types/domain";

type NotificationRowProps = {
  notification: Notification;
  unread: boolean;
  onClick: () => void;
  canNavigate?: boolean;
  className?: string;
};

/** Shared notification list row: dot + title, optional body, timestamp, and
 * optional "Open" hint. Canonical component per §5 (Appendix G).
 */
export function NotificationRow({
  notification,
  unread,
  onClick,
  canNavigate = false,
  className,
}: NotificationRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition-colors hover:bg-surface-hover",
        unread
          ? "border-brand bg-brand-soft/40"
          : "border-line bg-surface",
        className,
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
        {formatNotificationTime(notification.createdAt)}
        {canNavigate ? (
          <span>
            {" \u00b7 "}
            <span className="font-medium text-brand">Open \u2192</span>
          </span>
        ) : null}
      </span>
    </button>
  );
}

function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
