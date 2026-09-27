import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { UserAvatar, type AvatarUser } from "@/components/common/user-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";

type PersonRowProps = {
  user: AvatarUser;
  avatarSize?: number;
  avatarFallback?: "showcase" | "initial";
  toliName?: string | null;
  secondary?: ReactNode;
  secondaryClassName?: string;
  trailing?: ReactNode;
  className?: string;
};

/** Shared identity row: avatar + displayName + optional Toli badge + secondary text + trailing actions.
 * Canonical component per §5 (Appendix G). Used by connections, conversation list,
 * profile cards and member lists to eliminate duplicated identity markup.
 */
export function PersonRow({
  user,
  avatarSize = 40,
  avatarFallback = "showcase",
  toliName,
  secondary,
  secondaryClassName,
  trailing,
  className,
}: PersonRowProps) {
  const displayName = user.displayName || user.username || "Unknown user";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <UserAvatar user={user} size={avatarSize} fallback={avatarFallback} />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 truncate font-semibold text-ink">
          {displayName}
          {toliName ? <ToliBadge name={toliName} /> : null}
        </p>
        {secondary ? (
          <p className={cn("truncate text-sm text-ink-muted", secondaryClassName)}>
            {secondary}
          </p>
        ) : null}
      </div>

      {trailing ? (
        <div className="flex shrink-0 items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  );
}
