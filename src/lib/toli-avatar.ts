const AVATAR_SWATCHES = [
  "bg-identity-rose-soft text-identity-rose-ink",
  "bg-identity-blue-soft text-identity-blue-ink",
  "bg-identity-violet-soft text-identity-violet-ink",
  "bg-identity-emerald-soft text-identity-emerald-ink",
  "bg-identity-amber-soft text-identity-amber-ink",
];

export function toliAvatarSwatch(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return AVATAR_SWATCHES[Math.abs(hash) % AVATAR_SWATCHES.length];
}

export function toliAvatarLabel(key: string): string {
  return key.split("_").pop() ?? key;
}
