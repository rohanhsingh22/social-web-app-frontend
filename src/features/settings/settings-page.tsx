"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession, useLogout } from "@/features/auth/api";

export function SettingsPage() {
  const router = useRouter();
  const authQuery = useAuthSession();
  const logout = useLogout();

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/");
  }

  if (authQuery.data) {
    return (
      <AppShell>
        <section className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h1 className="text-2xl font-semibold text-slate-950">Settings</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manage the current Facebook-backed app session.
            </p>
            {logout.isError ? (
              <p className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Could not log out. Please try again.
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {logout.isPending ? "Logging out..." : "Log out"}
            </button>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <LockedPanel
        title="Settings are locked"
        message="Session settings are available after Facebook login."
      />
    </AppShell>
  );
}
