import { useParams } from "react-router-dom";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { useDmConversations } from "@/features/direct-messages/api";
import { ConversationList } from "@/features/direct-messages/conversation-list";
import { DmThread } from "@/features/direct-messages/dm-thread";
import { Skeleton } from "@/components/ui/skeleton";

export function MessagesPage() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const userId = authQuery.data?.user?.id ?? null;

  const { conversationId } = useParams<{ conversationId?: string }>();

  const conversationsQuery = useDmConversations(userId);
  const conversations = conversationsQuery.data ?? [];

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Login to view your messages and start conversations."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="flex h-[calc(100vh-4rem)] lg:h-dvh overflow-hidden">
        {/* Conversation list */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-line bg-surface">
          <div className="border-b border-line p-4">
            <h1 className="text-xl font-bold text-ink">Messages</h1>
          </div>

          {conversationsQuery.isLoading && !conversations.length ? (
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
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={conversationId}
              isLoading={conversationsQuery.isLoading}
            />
          )}
        </aside>

        {/* Chat thread / empty state */}
        <main className="flex-1 overflow-hidden">
          {conversationId ? (
            <DmThread conversationId={conversationId} />
          ) : (
            <div className="flex h-full min-h-0 items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-ink">
                  Select a conversation
                </h2>
                <p className="mt-2 text-sm text-ink-muted">
                  Choose a conversation from the list to start chatting.
                </p>
              </div>
            </div>
          )}
        </main>
      </section>
    </AppShell>
  );
}
