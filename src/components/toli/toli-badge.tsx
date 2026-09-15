import { cn } from "@/lib/utils";

const TOLI_STYLES: Record<string, string> = {
  Vector: "bg-identity-rose-soft text-identity-rose-ink",
  Wave: "bg-identity-blue-soft text-identity-blue-ink",
  Quantum: "bg-identity-violet-soft text-identity-violet-ink",
  Orbit: "bg-identity-emerald-soft text-identity-emerald-ink",
  Flux: "bg-identity-amber-soft text-identity-amber-ink",
};

export function ToliBadge({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        TOLI_STYLES[name] ?? "bg-surface-muted text-ink-muted",
        className,
      )}
    >
      {name}
    </span>
  );
}
