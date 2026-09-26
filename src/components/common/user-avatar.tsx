import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { avatarColor } from "@/lib/channel-colors";
import { ToliAvatar } from "@/components/toli/toli-avatar";
import {
  Avatar as AvatarPrimitive,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// Anything carrying an identity + photo state fits: UserSummary,
// ThoughtAuthor, DM profiles all satisfy this shape.
export type AvatarUser = {
  displayName: string;
  username?: string;
  avatarUrl?: string | null;
  profilePicture?: {
    type: "provider" | "toli";
    avatarUrl?: string | null;
    toliAvatarKey?: string | null;
  } | null;
};

type UserAvatarProps = {
  user: AvatarUser;
  size?: number;
  // "showcase" keeps the brand-ring photo style used across chat/DMs/
  // thoughts; "initial" is the plain colored-initial style (user menu).
  fallback?: "showcase" | "initial";
  className?: string;
};

// Single 2D user avatar for the whole app — always a circle. Resolution
// order: Toli catalog image by key -> provider photo URL -> initial
// fallback. Never renders the 3D character (see components/character).
export function UserAvatar({
  user,
  size = 40,
  fallback = "showcase",
  className,
}: UserAvatarProps) {
  const toliKey =
    user.profilePicture?.type === "toli"
      ? (user.profilePicture.toliAvatarKey ?? null)
      : null;

  if (toliKey) {
    return (
      <ToliAvatar
        avatarKey={toliKey}
        name={user.displayName}
        size={size}
        className={className}
      />
    );
  }

  // Provider photos may arrive top-level (UserSummary) or nested inside
  // profilePicture (thought authors) — honor both so provider users never
  // silently fall back to the initial.
  const photoUrl = user.avatarUrl ?? user.profilePicture?.avatarUrl ?? null;

  return (
    <ProviderAvatar
      user={user}
      photoUrl={photoUrl}
      size={size}
      fallback={fallback}
      className={className}
    />
  );
}

function ProviderAvatar({
  user,
  photoUrl,
  size,
  fallback,
  className,
}: Required<Pick<UserAvatarProps, "user" | "size" | "fallback">> & {
  photoUrl: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const showImage = Boolean(photoUrl) && !failed;

  if (fallback === "initial") {
    const color = avatarColor(user.displayName || user.username || "?");
    return (
      <AvatarPrimitive
        style={{ width: size, height: size }}
        className={cn("rounded-full", className)}
      >
        {showImage ? (
          <AvatarImage
            src={photoUrl ?? undefined}
            alt={user.displayName}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className={cn("rounded-full font-semibold text-sm", color.bg, color.text)}>
          {(user.displayName || "?").slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </AvatarPrimitive>
    );
  }

  return (
    <div
      className={cn(
        "showcase-avatar relative shrink-0 overflow-hidden rounded-full border-[3px] border-brand bg-brand/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={photoUrl ?? undefined}
          alt={user.displayName}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-2xl font-bold text-brand">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
