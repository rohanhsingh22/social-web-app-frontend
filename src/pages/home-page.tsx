import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ToliBadge } from "@/components/toli/toli-badge";
import { useAuthSession } from "@/features/auth/api";
import { useMyToliChannel } from "@/features/toli/api";

const CharacterScene = lazy(() =>
  import("@/components/character/character-scene").then((m) => ({
    default: m.CharacterScene,
  })),
);

const SHOWCASE_CHARACTERS = [
  { gender: "male" as const, skinColor: "#e0b88a", hairColor: "#1a1a1a", outfitColor: "#3b82f6" },
  { gender: "female" as const, skinColor: "#f5d0a9", hairColor: "#2c1a0e", outfitColor: "#ec4899" },
];

export default function HomePage() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const profile = authQuery.data?.profile;
  // Gate on the nested ref or the scalar id (session shapes vary).
  const hasToli = Boolean(profile?.toli ?? profile?.toliId);
  const toliName = profile?.toli?.name;
  const toliChannelQuery = useMyToliChannel(isLoggedIn && hasToli);

  if (authQuery.isLoading) {
    return (
      <AppShell>
        <section className="grid min-h-dvh place-items-center px-4">
          <div className="rounded-lg border border-line bg-surface p-5 text-sm text-ink-muted">
            Loading...
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
          message="Login to see your home, character, and Toli room."
        />
      </AppShell>
    );
  }

  const configs = profile?.characterConfig
    ? [profile.characterConfig]
    : SHOWCASE_CHARACTERS;

  return (
    <AppShell>
      <div className="relative flex h-full flex-col">
        {hasToli ? (
          <div className="absolute left-4 top-4 z-10 rounded-2xl border border-line bg-surface/90 p-3 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
              My Toli
            </p>
            <div className="mt-1">
              <ToliBadge
                name={
                  toliName ?? toliChannelQuery.data?.toli?.name ?? "Toli"
                }
              />
            </div>
            {toliChannelQuery.data ? (
              <Link
                to={`/channels/${toliChannelQuery.data.slug}`}
                className="mt-2 block text-sm font-semibold text-brand hover:underline"
              >
                Enter {toliName ?? toliChannelQuery.data.toli?.name ?? "Toli"} Chat →
              </Link>
            ) : (
              <p className="mt-2 text-xs text-ink-subtle">
                Your room is getting ready.
              </p>
            )}
          </div>
        ) : (
          // Logged in without a Toli yet.
          <div className="absolute left-4 top-4 z-10 rounded-2xl border border-line bg-surface/90 p-3 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
              My Toli
            </p>
            <Link
              to="/settings"
              className="mt-1 block text-sm font-semibold text-brand hover:underline"
            >
              Choose your Toli →
            </Link>
          </div>
        )}
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <Skeleton className="h-64 w-64 rounded-3xl" />
            </div>
          }
        >
          <CharacterScene configs={configs} interactive />
        </Suspense>
      </div>
    </AppShell>
  );
}
