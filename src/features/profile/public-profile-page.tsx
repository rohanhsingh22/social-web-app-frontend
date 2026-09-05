"use client";

import { Avatar } from "@/components/common/avatar";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { usePublicProfile } from "@/features/profile/api";

export function PublicProfilePage({ username }: { username: string }) {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const profileQuery = usePublicProfile(username, isLoggedIn);

  if (authQuery.isLoading) {
    return (
      <AppShell>
        <section className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Checking session...
          </div>
        </section>
      </AppShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message={`Login with Facebook to view @${username}'s public profile and connection status.`}
        />
      </AppShell>
    );
  }

  if (profileQuery.isLoading || !profileQuery.data) {
    return (
      <AppShell>
        <section className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Loading public profile...
          </div>
        </section>
      </AppShell>
    );
  }

  const profile = profileQuery.data;

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <Avatar user={profile} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-slate-950">
                {profile.displayName}
              </h1>
              <p className="text-sm text-slate-500">@{profile.username}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-700">
            {profile.bio || "No bio added yet."}
          </p>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-950">Age group</dt>
              <dd className="mt-1 text-slate-600">{profile.ageGroup || "Not shown"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Region</dt>
              <dd className="mt-1 text-slate-600">{profile.region || "Not shown"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-950">Languages</dt>
              <dd className="mt-1 text-slate-600">
                {profile.languages.length ? profile.languages.join(", ") : "Not shown"}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </AppShell>
  );
}
