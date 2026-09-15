import type { Channel } from "@/types/domain";

export type ChannelColor = {
  bg: string;
  text: string;
  ring: string;
};

const channelColors: Record<Channel["type"], ChannelColor> = {
  language: {
    bg: "bg-identity-blue-soft",
    text: "text-identity-blue-ink",
    ring: "ring-identity-blue",
  },
  age: {
    bg: "bg-identity-violet-soft",
    text: "text-identity-violet-ink",
    ring: "ring-identity-violet",
  },
  region: {
    bg: "bg-identity-emerald-soft",
    text: "text-identity-emerald-ink",
    ring: "ring-identity-emerald",
  },
  general: {
    bg: "bg-identity-amber-soft",
    text: "text-identity-amber-ink",
    ring: "ring-identity-amber",
  },
  toli: {
    bg: "bg-identity-rose-soft",
    text: "text-identity-rose-ink",
    ring: "ring-identity-rose",
  },
};

export function channelColor(type: Channel["type"]): ChannelColor {
  return channelColors[type] ?? channelColors.general;
}

const avatarPalette: ChannelColor[] = [
  { bg: "bg-identity-rose-soft", text: "text-identity-rose-ink", ring: "ring-identity-rose" },
  { bg: "bg-identity-violet-soft", text: "text-identity-violet-ink", ring: "ring-identity-violet" },
  { bg: "bg-identity-blue-soft", text: "text-identity-blue-ink", ring: "ring-identity-blue" },
  { bg: "bg-identity-emerald-soft", text: "text-identity-emerald-ink", ring: "ring-identity-emerald" },
  { bg: "bg-identity-amber-soft", text: "text-identity-amber-ink", ring: "ring-identity-amber" },
  { bg: "bg-identity-cyan-soft", text: "text-identity-cyan-ink", ring: "ring-identity-cyan" },
];

export function avatarColor(seed: string): ChannelColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % avatarPalette.length;
  return avatarPalette[index];
}
