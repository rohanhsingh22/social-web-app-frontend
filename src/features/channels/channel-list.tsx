import clsx from "clsx";
import { Link } from "react-router-dom";
import { Hash, Users } from "lucide-react";
import { ToliBadge } from "@/components/toli/toli-badge";
import { channelColor } from "@/lib/channel-colors";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Channel } from "@/types/domain";

export function ChannelList({
  activeSlug,
  channels,
  isLoading,
  onSelect,
  fullHeight = false,
  showHeader = true,
  toliChannel = null,
}: {
  activeSlug: string;
  channels: Channel[];
  isLoading: boolean;
  onSelect?: () => void;
  fullHeight?: boolean;
  showHeader?: boolean;
  toliChannel?: Channel | null;
}) {
  return (
    <div className={clsx("flex flex-col", fullHeight ? "h-dvh" : "h-full")}>
      {showHeader ? (
        <div className="border-b border-line p-4">
          <h2 className="text-base font-bold text-ink">Channels</h2>
          <p className="mt-1 text-xs text-ink-subtle">Public live rooms</p>
        </div>
      ) : null}
      <div className="chat-scrollbar flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : null}

        {toliChannel ? (
          <div className="mb-2">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
              My Toli
            </p>
            <Link
              key={toliChannel.id}
              to={`/channels/${toliChannel.slug}`}
              onClick={onSelect}
              className={clsx(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-surface-hover",
                activeSlug === toliChannel.slug && "bg-surface-hover",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg",
                  channelColor("toli").bg,
                  channelColor("toli").text,
                )}
              >
                <Users className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">
                  {toliChannel.name}
                </span>
                {toliChannel.toli ? (
                  <ToliBadge name={toliChannel.toli.name} className="mt-0.5" />
                ) : null}
              </span>
              <span className="text-xs text-ink-subtle">
                {toliChannel.onlineCount}
              </span>
            </Link>
          </div>
        ) : null}

        {channels.map((channel) => {
          const color = channelColor(channel.type);
          const active = activeSlug === channel.slug;

          return (
            <Link
              key={channel.id}
              to={channel.isDefault ? "/" : `/channels/${channel.slug}`}
              onClick={onSelect}
              className={clsx(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-surface-hover",
                active && "bg-surface-hover",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-lg",
                  color.bg,
                  color.text,
                )}
              >
                <Hash className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                {channel.name}
              </span>
              <span className="text-xs text-ink-subtle">{channel.onlineCount}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
