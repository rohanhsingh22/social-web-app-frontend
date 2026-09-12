import clsx from "clsx";
import Link from "next/link";
import { Hash } from "lucide-react";
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
}: {
  activeSlug: string;
  channels: Channel[];
  isLoading: boolean;
  onSelect?: () => void;
  fullHeight?: boolean;
  showHeader?: boolean;
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

        {channels.map((channel) => {
          const color = channelColor(channel.type);
          const active = activeSlug === channel.slug;

          return (
            <Link
              key={channel.id}
              href={channel.isDefault ? "/" : `/channels/${channel.slug}`}
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
