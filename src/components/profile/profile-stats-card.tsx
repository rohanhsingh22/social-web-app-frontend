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
        "showcase-stat flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/10",
        className,
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/20 text-brand">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
          {label}
        </p>
        <p
          className={cn(
            "truncate text-sm font-semibold",
            isSet ? "text-white" : "text-white/40",
          )}
        >
          {display}
        </p>
      </div>
    </div>
  );
}
