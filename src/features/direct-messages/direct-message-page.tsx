"use client";

import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { Avatar } from "@/components/common/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function DirectMessagePage({ conversationId }: { conversationId: string }) {
  const authQuery = useAuthSession();

  if (!authQuery.data) {
    return (
      <AppShell>
        <LockedPanel
          title="Private chat is locked"
          message={`Conversation ${conversationId} can open after Facebook login and an accepted connection.`}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex items-center gap-3 border-b border-line p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <Avatar
                  user={{
                    id: String(item),
                    username: "placeholder",
                    displayName: "User",
                  }}
                />
                <div className="space-y-2 rounded-xl bg-surface-muted p-3">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div className="p-4">
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
