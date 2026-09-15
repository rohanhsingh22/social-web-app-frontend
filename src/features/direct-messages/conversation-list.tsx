import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { SenderAvatar } from "@/components/common/sender-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DmConversation } from "@/types/domain";

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect,
}: {
  conversations: DmConversation[];
  activeId?: string;
  isLoading: boolean;
  onSelect?: () => void;
}) {
  return (
    <div className="flex flex-col overflow-y-auto">
      {isLoading ? (
        <div className="space-y-1 p-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg px-3 py-3"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && conversations.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-ink-muted">
            No conversations yet.
          </p>
          <p className="mt-1 text-xs text-ink-subtle">
            Accept a connection request to start chatting.
          </p>
        </div>
      ) : null}

      {!isLoading &&
        conversations.map((conversation) => {
          const active = activeId === conversation.id;
          const peer = conversation.otherUser;
          const profile = peer.profile;
          const displayName =
            profile.displayName || profile.username || "Unknown user";
          const latest = conversation.latestMessage;

          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              onClick={onSelect}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-surface-hover",
                active && "bg-surface-hover",
              )}
            >
              <SenderAvatar sender={profile} size={40} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-semibold text-ink">
                  {displayName}
                  {profile.toli ? (
                    <ToliBadge name={profile.toli.name} />
                  ) : null}
                </p>
                {latest ? (
                  <p className="truncate text-xs text-ink-muted">
                    {latest.body}
                  </p>
                ) : (
                  <p className="truncate text-xs text-ink-subtle">
                    No messages yet
                  </p>
                )}
              </div>
              {latest ? (
                <time className="shrink-0 text-xs text-ink-subtle">
                  {new Intl.DateTimeFormat("en", {
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(latest.createdAt))}
                </time>
              ) : null}
            </Link>
          );
        })}
    </div>
  );
}
