import type { HomeMember } from "@/types/domain";
import { cn } from "@/lib/utils";

// HTML identity label floating with the character (spec #79): display name,
// subtle owner mark, offline and speaking states. Rendered as DOM inside
// drei's <Html> so it stays accessible and truncatable.
export function HomeCharacterLabel({
  member,
  speaking = false,
}: {
  member: HomeMember;
  speaking?: boolean;
}) {
  const offline = member.presence === "offline";
  const initial = member.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-1 transition-opacity",
        offline && "opacity-70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full border text-xs font-bold",
          speaking
            ? "border-brand bg-brand text-white shadow-[0_0_12px_rgba(255,46,99,0.8)]"
            : "border-line bg-surface text-ink",
          offline && "grayscale",
        )}
      >
        {initial}
      </span>
      <span className="flex max-w-28 items-center gap-1 rounded-full border border-line bg-surface/90 px-2 py-0.5 backdrop-blur">
        <span className="truncate text-xs font-semibold text-ink">
          {member.displayName}
        </span>
        {member.role === "OWNER" && (
          <span
            title="Home owner"
            aria-label="Home owner"
            className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-brand"
          >
            · Owner
          </span>
        )}
      </span>
      <span className="sr-only">
        {member.displayName}
        {member.role === "OWNER" ? ", owner" : ""}
        {offline ? ", offline" : ""}
        {speaking ? ", speaking" : ""}
      </span>
      {offline && (
        <span className="rounded-full bg-surface/80 px-2 py-px text-[10px] font-medium uppercase tracking-wide text-ink-subtle">
          Offline
        </span>
      )}
    </div>
  );
}
