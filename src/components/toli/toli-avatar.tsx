import { cn } from "@/lib/utils";
import { toliAvatarLabel, toliAvatarSwatch } from "@/lib/toli-avatar";

export function ToliAvatar({
  avatarKey,
  name,
  size = 40,
  className,
}: {
  avatarKey: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      title={`${name} (${avatarKey})`}
      className={cn(
        "grid shrink-0 place-items-center rounded-full text-xs font-black",
        toliAvatarSwatch(avatarKey),
        className,
      )}
    >
      <span aria-hidden>{toliAvatarLabel(avatarKey)}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}
