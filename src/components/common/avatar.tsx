import { cn } from "@/lib/utils";
import { avatarColor } from "@/lib/channel-colors";
import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserSummary } from "@/types/domain";

export function Avatar({ user, size = "md" }: { user: UserSummary; size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };
  const color = avatarColor(user.displayName || user.username || user.id);

  return (
    <AvatarPrimitive className={dimensions[size]}>
      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
      <AvatarFallback
        className={cn("font-semibold", color.bg, color.text)}
      >
        {(user.displayName || "?").slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </AvatarPrimitive>
  );
}
