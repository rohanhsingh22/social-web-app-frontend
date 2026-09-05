"use client";

import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";

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
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h1 className="text-2xl font-semibold text-slate-950">
            Private chat unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Direct messages require the connection and DM backend endpoints.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
