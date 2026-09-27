import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { PersonRow } from "@/components/common/person-row";
import { EmptyState } from "@/components/common/empty-state";
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
        <div className="p-4">
          <EmptyState
            title="No conversations yet"
            message="Accept a connection request to start chatting."
          />
        </div>
      ) : null}

      {!isLoading &&
        conversations.map((conversation) => {
          const active = activeId === conversation.id;
          const peer = conversation.otherUser;
          const profile = peer.profile;
          const latest = conversation.latestMessage;

          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              onClick={onSelect}
              className={cn(
                "block rounded-xl px-3 py-3 text-sm transition-colors duration-150 hover:bg-surface-hover",
                active && "bg-brand-soft hover:bg-brand-soft",
              )}
            >
              <PersonRow
                user={profile}
                avatarSize={40}
                toliName={profile.toli?.name ?? null}
                secondary={latest ? latest.body : "No messages yet"}
                secondaryClassName="text-xs"
                trailing={
                  latest ? (
                    <time className="text-xs text-ink-subtle">
                      {new Intl.DateTimeFormat("en", {
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(latest.createdAt))}
                    </time>
                  ) : undefined
                }
              />
            </Link>
          );
        })}
    </div>
  );
}
