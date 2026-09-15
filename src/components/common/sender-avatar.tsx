import { ShowcaseAvatar } from "@/components/profile/showcase-avatar";
import { ToliAvatar } from "@/components/toli/toli-avatar";

type SenderLike = {
  displayName: string;
  avatarUrl?: string | null;
  profilePicture?: {
    type: "provider" | "toli";
    toliAvatarKey?: string | null;
  } | null;
};

// Resolved social avatar: Toli avatars render from the static catalog by key,
// provider avatars by URL. Never renders the 3D character.
export function SenderAvatar({
  sender,
  size = 40,
}: {
  sender: SenderLike;
  size?: number;
}) {
  const toliKey =
    sender.profilePicture?.type === "toli"
      ? sender.profilePicture.toliAvatarKey
      : null;

  if (toliKey) {
    return (
      <ToliAvatar avatarKey={toliKey} name={sender.displayName} size={size} />
    );
  }

  return (
    <ShowcaseAvatar
      src={sender.avatarUrl}
      alt={sender.displayName}
      width={size}
      height={size}
    />
  );
}
