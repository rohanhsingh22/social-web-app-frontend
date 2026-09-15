import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
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
  const profile = authQuery.data?.profile;
  const toliChannelQuery = useMyToliChannel(Boolean(profile?.toli));

  const configs = profile?.characterConfig
    ? [profile.characterConfig]
    : SHOWCASE_CHARACTERS;

  return (
    <AppShell>
      <div className="relative flex h-full flex-col">
        {profile?.toli ? (
          <div className="absolute left-4 top-4 z-10 rounded-2xl border border-line bg-surface/90 p-3 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-subtle">
              My Toli
            </p>
            <div className="mt-1">
              <ToliBadge name={profile.toli.name} />
            </div>
            {toliChannelQuery.data ? (
              <Link
                to={`/channels/${toliChannelQuery.data.slug}`}
                className="mt-2 block text-sm font-semibold text-brand hover:underline"
              >
                Enter {profile.toli.name} Chat →
              </Link>
            ) : (
              <p className="mt-2 text-xs text-ink-subtle">
                Your room is getting ready.
              </p>
            )}
          </div>
        ) : authQuery.data ? (
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
        ) : null}
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
