import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toli } from "@/types/domain";

export function ToliPicker({
  tolis,
  value,
  onChange,
  disabled = false,
}: {
  tolis: Toli[];
  value: string | null;
  onChange: (toliId: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {tolis.map((toli) => {
          const active = value === toli.id;
          return (
            <button
              key={toli.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(active ? null : toli.id)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all disabled:opacity-50",
                active
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-line-strong",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">{toli.name}</span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                ) : null}
              </span>
              <span className="mt-1 block text-xs leading-5 text-ink-muted">
                {toli.motto}
              </span>
              <span className="mt-1 block text-[11px] text-ink-subtle">
                {toli.memberCount.toLocaleString()} members
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(null)}
        className={cn(
          "rounded-xl border border-dashed border-line-strong px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-50",
          value === null && "border-solid text-ink",
        )}
      >
        Skip — continue without a Toli
      </button>
    </div>
  );
}
