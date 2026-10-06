import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { HomeConnectionsDialog } from "@/components/home/home-connections-dialog";
import { HomeControls } from "@/components/home/home-controls";
import {
  HomeVoiceProvider,
} from "@/features/home/voice/home-voice-context";
import { useHomeVoiceContext } from "@/features/home/voice/use-home-voice-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToliBadge } from "@/components/toli/toli-badge";
import { useAuthSession } from "@/features/auth/api";
import { useHome } from "@/features/home/use-home";
import { useMyToliChannel } from "@/features/toli/api";
import type { HomeMember } from "@/types/domain";

const HomeStage = lazy(() =>
  import("@/components/home/home-character-scene").then((m) => ({
    default: m.HomeCharacterScene,
  })),
);

// Shared Home: voice session wraps the speaking stage + controls. Solo
// visitors render the stage alone — no mic, no room.
function SharedHomeStage({ members, homeId }: { members: HomeMember[]; homeId: string }) {
  return (
    <HomeVoiceProvider homeId={homeId}>
      <VoiceStage members={members} />
    </HomeVoiceProvider>
  );
}

function VoiceStage({ members }: { members: HomeMember[] }) {
  const { speakingIds } = useHomeVoiceContext();

  return (
    <div className="flex h-full flex-col gap-2 pb-4">
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={
            <div className="grid h-full place-items-center">
              <Skeleton className="h-64 w-64 rounded-3xl" />
            </div>
          }
        >
          <HomeStage members={members} speakingIds={speakingIds} />
        </Suspense>
      </div>
      <HomeControls />
    </div>
  );
}

export default function HomePage() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const profile = authQuery.data?.profile;
  const userId = authQuery.data?.user.id;
  // Live Home state; realtime invalidation comes from the global
  // HomeOverlays mount in AppShell (invitation overlay included).
  const homeQuery = useHome();
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  // Gate on the nested ref or the scalar id (session shapes vary).
  const hasToli = Boolean(profile?.toli ?? profile?.toliId);
  const toliName = profile?.toli?.name;
  const toliChannelQuery = useMyToliChannel(isLoggedIn && hasToli);

  if (authQuery.isLoading || (isLoggedIn && homeQuery.isLoading)) {
    return (
      <AppShell>
        <section className="grid min-h-dvh place-items-center px-4">
          <div className="w-full max-w-md space-y-3 rounded-2xl border border-line bg-surface p-5">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <span role="status" className="sr-only">
              Loading home…
            </span>
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

  // Solo Home for the homeless: the user always sees themselves on stage.
  const members: HomeMember[] =
    homeQuery.home?.members ??
    (userId
      ? [
          {
            userId,
            publicUserId: profile?.publicUserId ?? null,
            displayName: profile?.displayName ?? "You",
            role: "OWNER" as const,
            presence: "online" as const,
            characterConfig: profile?.characterConfig ?? null,
            joinedAt: new Date().toISOString(),
          },
        ]
      : []);

  return (
    <AppShell>
      <div className="relative flex h-full flex-col">
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {hasToli ? (
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="page-header-eyebrow">My Toli</p>
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
                  Enter {toliName ?? toliChannelQuery.data.toli?.name ?? "Toli"}{" "}
                  Chat →
                </Link>
              ) : (
                <p className="mt-2 text-xs text-ink-subtle">
                  Your room is getting ready.
                </p>
              )}
            </div>
          ) : (
            // Logged in without a Toli yet.
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="page-header-eyebrow">My Toli</p>
              <Link
                to="/settings"
                className="mt-1 block text-sm font-semibold text-brand hover:underline"
              >
                Choose your Toli →
              </Link>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setConnectionsOpen(true)}
            aria-haspopup="dialog"
          >
            <Users className="h-4 w-4" aria-hidden />
            Connections
          </Button>
        </div>
        {homeQuery.isError ? (
          <div className="grid flex-1 place-items-center p-6">
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-ink-muted">
                Couldn&apos;t load your Home.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => homeQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : homeQuery.home ? (
          <SharedHomeStage members={members} homeId={homeQuery.home.id} />
        ) : (
          <Suspense
            fallback={
              <div className="grid h-full place-items-center">
                <Skeleton className="h-64 w-64 rounded-3xl" />
              </div>
            }
          >
            <HomeStage members={members} />
          </Suspense>
        )}
        <HomeConnectionsDialog
          open={connectionsOpen}
          onOpenChange={setConnectionsOpen}
        />
      </div>
    </AppShell>
  );
}
