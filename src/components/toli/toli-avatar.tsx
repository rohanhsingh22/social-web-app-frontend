import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  resolveToliAvatarImage,
  toliAvatarLabel,
  toliAvatarSwatch,
} from "@/lib/toli-avatar";

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
  const src = resolveToliAvatarImage(avatarKey);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [avatarKey]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        title={`${name} (${avatarKey})`}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

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
