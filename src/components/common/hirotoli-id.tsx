import { cn } from "@/lib/utils";

// Single display for user identity across the app: the HiRotoli public ID
// (HT-XXXXXXXX), falling back to the legacy @username only when the ID is
// absent (e.g. stale cached payloads).
export function HirotoliId({
  publicUserId,
  username,
  className,
}: {
  publicUserId?: string | null;
  username?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("font-mono", className)}>
      {publicUserId ?? (username ? `@${username}` : "unknown")}
    </span>
  );
}
