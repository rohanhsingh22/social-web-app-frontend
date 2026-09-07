"use client";

import { useState } from "react";
import {
  Globe,
  LogOut,
  MapPin,
  MessageSquare,
  Palette,
  Shield,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession, useLogout } from "@/features/auth/api";
import { useMyProfile, useUpdateMyProfile } from "@/features/profile/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CharacterScene } from "@/components/character/character-scene";
import { ProfileStatsCard } from "@/components/profile/profile-stats-card";
import { ShowcaseAvatar } from "@/components/profile/showcase-avatar";
import {
  DEFAULT_CHARACTER_CONFIG,
  type CharacterConfig,
  type Profile,
} from "@/types/domain";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

const REGION_OPTIONS = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia",
  "Oceania",
] as const;

const CITY_OPTIONS = [
  "New York",
  "London",
  "Paris",
  "Berlin",
  "Tokyo",
  "Sydney",
  "São Paulo",
  "Lagos",
  "Mumbai",
  "Toronto",
] as const;

const PRIMARY_LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Hindi",
  "Japanese",
  "Mandarin",
  "Arabic",
  "Russian",
] as const;

type ProfileFormState = {
  username: string;
  displayName: string;
  bio: string;
  dob: string;
  region: string;
  city: string;
  gender: CharacterConfig["gender"];
  skinColor: string;
  hairColor: string;
  outfitColor: string;
  primaryLanguage: string;
  languages: string;
};

function toFormState(profile: Profile): ProfileFormState {
  const config = profile.characterConfig ?? DEFAULT_CHARACTER_CONFIG;
  return {
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    dob: profile.dob ?? "",
    region: profile.region ?? "",
    city: profile.city ?? "",
    gender: config.gender,
    skinColor: config.skinColor ?? DEFAULT_CHARACTER_CONFIG.skinColor ?? "#f5d0a9",
    hairColor: config.hairColor ?? DEFAULT_CHARACTER_CONFIG.hairColor ?? "#2c1a0e",
    outfitColor: config.outfitColor ?? DEFAULT_CHARACTER_CONFIG.outfitColor ?? "#3b82f6",
    primaryLanguage: profile.primaryLanguage ?? "",
    languages: profile.languages.join(", "),
  };
}

export function ProfilePage() {
  const router = useRouter();
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const profileQuery = useMyProfile(isLoggedIn);
  const updateProfile = useUpdateMyProfile();
  const logout = useLogout();
  const profile = profileQuery.data ?? authQuery.data?.profile;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState | null>(null);

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/");
  }

  if (authQuery.isLoading) {
    return (
      <AppShell>
        <section className="grid h-full place-items-center px-4">
          <div className="rounded-lg border border-line bg-surface p-5 text-sm text-ink-muted">
            Loading profile...
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
          message="Your profile opens after Facebook login. Guests cannot view or edit private profile details."
        />
      </AppShell>
    );
  }

  if (profileQuery.isLoading || !profile) {
    return (
      <AppShell>
        <section className="grid h-full place-items-center px-4">
          <div className="rounded-lg border border-line bg-surface p-5 text-sm text-ink-muted">
            Loading your profile details...
          </div>
        </section>
      </AppShell>
    );
  }

  const currentProfile = profile;

  function openEditor() {
    setForm(toFormState(currentProfile));
    setOpen(true);
  }

  async function saveProfile() {
    if (!form) {
      return;
    }

    await updateProfile.mutateAsync({
      username: form.username.trim(),
      displayName: form.displayName.trim(),
      bio: form.bio.trim(),
      dob: form.dob || undefined,
      region: form.region,
      city: form.city,
      gender: form.gender,
      characterConfig: {
        gender: form.gender,
        skinColor: form.skinColor,
        hairColor: form.hairColor,
        outfitColor: form.outfitColor,
      },
      primaryLanguage: form.primaryLanguage,
      languages: form.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setOpen(false);
    setForm(null);
  }

  return (
    <AppShell>
      <section className="showcase-layout relative h-full w-full overflow-hidden">
        {/* Full-screen character scene as background */}
        <div className="absolute inset-0">
          <CharacterScene config={profile.characterConfig} />
        </div>

        {/* Top gradient overlay for header readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Bottom gradient overlay for action bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Header */}
        <header className="showcase-header absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 lg:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ShowcaseAvatar
              src={currentProfile.avatarUrl}
              alt={currentProfile.displayName}
              width={56}
              height={56}
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-white drop-shadow-lg lg:text-2xl">
                {currentProfile.displayName}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-white/60">
                <span className="truncate">@{currentProfile.username}</span>
                {currentProfile.role && currentProfile.role !== "user" && (
                  <span className="inline-flex items-center gap-1 rounded bg-brand/30 px-1.5 py-0.5 text-[10px] font-semibold text-brand backdrop-blur-sm">
                    <Shield className="h-3 w-3" aria-hidden />
                    {currentProfile.role}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={openEditor}
              className="border border-white/10 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              aria-label="Customize character"
            >
              <Palette className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              type="button"
              onClick={openEditor}
              className="bg-brand hover:bg-brand-hover"
            >
              <UserRound className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Edit Profile</span>
            </Button>
          </div>
        </header>

        {/* Stats panel — right side on desktop, bottom on mobile */}
        <aside className="showcase-stats absolute bottom-20 right-4 z-10 hidden w-72 flex-col gap-2 lg:bottom-24 lg:flex lg:p-6">
          {currentProfile.ageGroup ? (
            <ProfileStatsCard
              icon={Shield}
              label="Age Group"
              value={currentProfile.ageGroup}
            />
          ) : null}
          {currentProfile.region ? (
            <ProfileStatsCard
              icon={MapPin}
              label="Location"
              value={
                currentProfile.city
                  ? `${currentProfile.city}, ${currentProfile.region}`
                  : currentProfile.region
              }
            />
          ) : null}
          {currentProfile.languages.length > 0 && (
            <ProfileStatsCard
              icon={Globe}
              label="Languages"
              value={currentProfile.languages.join(", ")}
            />
          )}
          {currentProfile.bio && (
            <ProfileStatsCard
              icon={MessageSquare}
              label="Bio"
              value={currentProfile.bio}
              fallback=""
            />
          )}
        </aside>

        {/* Mobile stats — horizontal scroll at bottom */}
        <div className="absolute inset-x-0 bottom-20 z-10 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden">
          {currentProfile.ageGroup && (
            <div className="shrink-0">
              <ProfileStatsCard
                icon={Shield}
                label="Age"
                value={currentProfile.ageGroup}
              />
            </div>
          )}
          {currentProfile.region && (
            <div className="shrink-0">
              <ProfileStatsCard
                icon={MapPin}
                label="Region"
                value={currentProfile.region}
              />
            </div>
          )}
          {currentProfile.languages.length > 0 && (
            <div className="shrink-0">
              <ProfileStatsCard
                icon={Globe}
                label="Languages"
                value={currentProfile.languages.join(", ")}
              />
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="showcase-actions absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 p-4 lg:justify-start lg:p-6">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={openEditor}
            className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            <Palette className="h-4 w-4" aria-hidden />
            Customize
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={openEditor}
            className="bg-brand shadow-lg shadow-brand/30 hover:bg-brand-hover"
          >
            <UserRound className="h-4 w-4" aria-hidden />
            Edit Profile
          </Button>
        </div>
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Your profile</SheetTitle>
            <SheetDescription>
              Update how you appear across the app.
            </SheetDescription>
          </SheetHeader>

          {form ? (
            <form className="grid gap-4">
              <Label className="grid gap-2">
                <span>Display name</span>
                <Input
                  value={form.displayName}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, displayName: event.target.value } : current,
                    )
                  }
                />
              </Label>

              <Label className="grid gap-2">
                <span>Username</span>
                <Input
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, username: event.target.value } : current,
                    )
                  }
                />
              </Label>

              <Label className="grid gap-2">
                <span>Gender</span>
                <Select
                  value={form.gender}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? { ...current, gender: event.target.value as CharacterConfig["gender"] }
                        : current,
                    )
                  }
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Label>

              <div className="grid grid-cols-3 gap-3">
                <Label className="grid gap-2">
                  <span>Skin</span>
                  <Input
                    type="color"
                    value={form.skinColor}
                    onChange={(event) =>
                      setForm((current) =>
                        current ? { ...current, skinColor: event.target.value } : current,
                      )
                    }
                    className="h-10 cursor-pointer p-1"
                  />
                </Label>
                <Label className="grid gap-2">
                  <span>Hair</span>
                  <Input
                    type="color"
                    value={form.hairColor}
                    onChange={(event) =>
                      setForm((current) =>
                        current ? { ...current, hairColor: event.target.value } : current,
                      )
                    }
                    className="h-10 cursor-pointer p-1"
                  />
                </Label>
                <Label className="grid gap-2">
                  <span>Outfit</span>
                  <Input
                    type="color"
                    value={form.outfitColor}
                    onChange={(event) =>
                      setForm((current) =>
                        current ? { ...current, outfitColor: event.target.value } : current,
                      )
                    }
                    className="h-10 cursor-pointer p-1"
                  />
                </Label>
              </div>

              <Label className="grid gap-2">
                <span>Date of birth</span>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, dob: event.target.value } : current,
                    )
                  }
                />
              </Label>

              <Label className="grid gap-2">
                <span>Region</span>
                <Select
                  value={form.region}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, region: event.target.value } : current,
                    )
                  }
                >
                  <option value="">Not set</option>
                  {REGION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Label>

              <Label className="grid gap-2">
                <span>City</span>
                <Select
                  value={form.city}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, city: event.target.value } : current,
                    )
                  }
                >
                  <option value="">Not set</option>
                  {CITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Label>

              <Label className="grid gap-2">
                <span>Primary language</span>
                <Select
                  value={form.primaryLanguage}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? { ...current, primaryLanguage: event.target.value }
                        : current,
                    )
                  }
                >
                  <option value="">Not set</option>
                  {PRIMARY_LANGUAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Label>

              <Label className="grid gap-2">
                <span>Languages</span>
                <Input
                  value={form.languages}
                  placeholder="English, Spanish"
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, languages: event.target.value } : current,
                    )
                  }
                />
              </Label>

              <Label className="grid gap-2">
                <span>Bio</span>
                <Textarea
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, bio: event.target.value } : current,
                    )
                  }
                  rows={4}
                />
              </Label>

              {updateProfile.isError ? (
                <p className="rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
                  Could not save profile. Please check the fields and try again.
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  onClick={saveProfile}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          <div className="mt-6 border-t border-line pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {logout.isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
