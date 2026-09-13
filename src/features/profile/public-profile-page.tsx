import { Globe, MapPin, MessageSquare, Shield } from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { usePublicProfile } from "@/features/profile/api";
import { useCreateConnectionRequestMutation } from "@/rtk/connections/connections-api";
import { Button } from "@/components/ui/button";
import { CharacterScene } from "@/components/character/character-scene";
import { ProfileStatsCard } from "@/components/profile/profile-stats-card";
import { ShowcaseAvatar } from "@/components/profile/showcase-avatar";

export function PublicProfilePage({ username }: { username: string }) {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const profileQuery = usePublicProfile(username, isLoggedIn);
  const [createRequest, createState] = useCreateConnectionRequestMutation();

  if (authQuery.isLoading) {
    return (
      <AppShell>
        <section className="grid h-full place-items-center px-4">
          <div className="text-sm text-ink-muted">Loading...</div>
        </section>
      </AppShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message={`Login to view @${username}'s profile.`}
        />
      </AppShell>
    );
  }

  if (profileQuery.isLoading || !profileQuery.data) {
    return (
      <AppShell>
        <section className="grid h-full place-items-center px-4">
          <div className="text-sm text-ink-muted">Loading character...</div>
        </section>
      </AppShell>
    );
  }

  const profile = profileQuery.data;

  return (
    <AppShell>
      <section className="showcase-layout relative h-full w-full overflow-hidden">
        {/* Full-screen character scene as background */}
        <div className="absolute inset-0">
          <CharacterScene config={profile.characterConfig} />
        </div>

        {/* Top gradient overlay for header readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Bottom gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Header */}
        <header className="showcase-header absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 lg:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ShowcaseAvatar
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={56}
              height={56}
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-white drop-shadow-lg lg:text-2xl">
                {profile.displayName}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-white/60">
                <span className="truncate">@{profile.publicUserId ?? profile.username}</span>
                {profile.role && profile.role !== "user" && (
                  <span className="inline-flex items-center gap-1 rounded bg-brand/30 px-1.5 py-0.5 text-[10px] font-semibold text-brand backdrop-blur-sm">
                    <Shield className="h-3 w-3" aria-hidden />
                    {profile.role}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="bg-brand hover:bg-brand-hover"
              disabled={createState.isLoading || !profile.publicUserId}
              onClick={() => {
                if (profile.publicUserId) {
                  void createRequest({ receiverUserId: profile.publicUserId });
                }
              }}
            >
              {createState.isLoading ? "Sending…" : "Connect"}
            </Button>
          </div>
        </header>

        {/* Stats panel — right side on desktop */}
        <aside className="showcase-stats absolute bottom-20 right-4 z-10 hidden w-72 flex-col gap-2 lg:bottom-24 lg:flex lg:p-6">
          {profile.ageGroup ? (
            <ProfileStatsCard
              icon={Shield}
              label="Age Group"
              value={profile.ageGroup}
            />
          ) : null}
          {profile.region ? (
            <ProfileStatsCard
              icon={MapPin}
              label="Location"
              value={
                profile.city
                  ? `${profile.city}, ${profile.region}`
                  : profile.region
              }
            />
          ) : null}
          {profile.languages.length > 0 && (
            <ProfileStatsCard
              icon={Globe}
              label="Languages"
              value={profile.languages.join(", ")}
            />
          )}
          {profile.bio && (
            <ProfileStatsCard
              icon={MessageSquare}
              label="Bio"
              value={profile.bio}
              fallback=""
            />
          )}
        </aside>

        {/* Mobile stats — horizontal scroll at bottom */}
        <div className="absolute inset-x-0 bottom-20 z-10 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden">
          {profile.ageGroup && (
            <div className="shrink-0">
              <ProfileStatsCard
                icon={Shield}
                label="Age"
                value={profile.ageGroup}
              />
            </div>
          )}
          {profile.region && (
            <div className="shrink-0">
              <ProfileStatsCard
                icon={MapPin}
                label="Region"
                value={profile.region}
              />
            </div>
          )}
          {profile.languages.length > 0 && (
            <div className="shrink-0">
              <ProfileStatsCard
                icon={Globe}
                label="Languages"
                value={profile.languages.join(", ")}
              />
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="showcase-actions absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 p-4 lg:justify-start lg:p-6">
          <Button
            type="button"
            size="lg"
            className="bg-brand shadow-lg shadow-brand/30 hover:bg-brand-hover"
          >
            Connect
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            Message
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
