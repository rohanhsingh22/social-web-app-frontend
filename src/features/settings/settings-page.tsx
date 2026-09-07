"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeControls } from "@/components/theme/theme-controls";
import { useAuthSession, useLogout } from "@/features/auth/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-ink">Settings</h1>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Manage your session and appearance.
            </p>

            <Separator className="my-8" />
            <ThemeControls />
            <Separator className="my-8" />

            <h2 className="text-base font-semibold text-ink">Account</h2>
            <p className="mt-1 text-sm text-ink-subtle">
              Manage the current Facebook-backed app session.
            </p>
            {logout.isError ? (
              <p className="mt-5 rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
                Could not log out. Please try again.
              </p>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="mt-5"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {logout.isPending ? "Logging out..." : "Log out"}
            </Button>
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
