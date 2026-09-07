"use client";

import { Search } from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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
        <h1 className="text-2xl font-bold text-ink">Connections</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Manage your connections, requests, and private conversations.
        </p>

        <Tabs defaultValue="connections" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            <div className="grid gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4"
                >
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <EmptyState
              title="No pending requests"
              message="Incoming and outgoing connection requests will appear here."
            />
          </TabsContent>

          <TabsContent value="search">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <Input
                placeholder="Search by username or display name"
                className="pl-10"
              />
            </div>
            <EmptyState
              title="No search results"
              message="User search will be available once the backend endpoint is wired."
            />
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-line-strong bg-surface-muted p-8 text-center">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
    </div>
  );
}
