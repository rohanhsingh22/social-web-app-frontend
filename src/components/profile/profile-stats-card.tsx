import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileStatsCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | undefined;
  fallback?: string;
  className?: string;
};

export function ProfileStatsCard({
  icon: Icon,
  label,
  value,
  fallback = "Not set",
  className,
}: ProfileStatsCardProps) {
  const display = value && value.length > 0 ? value : fallback;
  const isSet = Boolean(value && value.length > 0);

  return (
    <div
      className={cn(
        "showcase-stat flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-colors duration-150 hover:bg-surface-hover",
        className,
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
          {label}
        </p>
        <p
          className={cn(
            "truncate text-sm font-semibold",
            isSet ? "text-ink" : "text-ink-subtle",
          )}
        >
          {display}
        </p>
      </div>
    </div>
  );
}
