import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectionBannerProps = {
  status: "reconnecting" | "disconnected" | "offline";
  className?: string;
};

/**
 * Standard offline/reconnecting banner (§6.5 / §7).
 * Small persistent banner; avoids duplicate sends / lost drafts messaging.
 */
export function ConnectionBanner({ status, className }: ConnectionBannerProps) {
  const copy =
    status === "offline"
      ? "You are offline. Messages will send when you reconnect."
      : status === "reconnecting"
        ? "Reconnecting… your draft is kept."
        : "Connection lost. Trying to reconnect…";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 border-b border-warning bg-warning-soft px-4 py-2 text-center text-xs font-medium text-warning-ink",
        className,
      )}
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{copy}</span>
    </div>
  );
}
