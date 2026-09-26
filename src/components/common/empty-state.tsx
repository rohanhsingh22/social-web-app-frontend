import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
  className?: string;
};

/** Standard empty state (§5 / §7): icon, title, helpful sentence, optional action. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  actionLabel,
  onAction,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-muted text-ink-subtle">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-2 text-base font-semibold text-ink">{title}</p>
      {message ? (
        <p className="max-w-sm text-sm leading-6 text-ink-muted">{message}</p>
      ) : null}
      {action ??
        (actionLabel && onAction ? (
          <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
