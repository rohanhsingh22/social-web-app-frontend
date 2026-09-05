"use client";

import { Search } from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";

export function ConnectionsPage() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Connections, requests, user search, and private chat are available after Facebook login."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold text-slate-950">Connections</h1>
        <div className="mt-5 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
          <Search className="h-4 w-4 text-slate-500" aria-hidden />
          <input
            placeholder="Search by username or display name"
            disabled
            className="h-full flex-1 border-0 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">
            No connection data available
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This screen will render server connections once the connection
            endpoints are available.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
