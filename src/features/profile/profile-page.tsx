import { Suspense, useEffect, useState } from "react";
import {
  CalendarDays,
  Globe,
  LogOut,
  MapPin,
  Palette,
  Pencil,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

import { Avatar } from "@/components/character/avatar";
import { Canvas } from "@react-three/fiber";
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
    skinColor:
      config.skinColor ?? DEFAULT_CHARACTER_CONFIG.skinColor ?? "#f5d0a9",
    hairColor:
      config.hairColor ?? DEFAULT_CHARACTER_CONFIG.hairColor ?? "#2c1a0e",
    outfitColor:
      config.outfitColor ?? DEFAULT_CHARACTER_CONFIG.outfitColor ?? "#3b82f6",
    primaryLanguage: profile.primaryLanguage ?? "",
    languages: profile.languages.join(", "),
  };
}

export function ProfilePage() {
  const navigate = useNavigate();

  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);

  const profileQuery = useMyProfile(isLoggedIn);
  const updateProfile = useUpdateMyProfile();
  const logout = useLogout();

  const profile = profileQuery.data ?? authQuery.data?.profile;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState | null>(null);

  const [savedTheme, setSavedTheme] = useState("System");

  const getCharacterConfig = (
    config: string | CharacterConfig | null | undefined,
  ): CharacterConfig => {
    if (!config) {
      return DEFAULT_CHARACTER_CONFIG;
    }

    if (typeof config === "string") {
      try {
        return JSON.parse(config) as CharacterConfig;
      } catch {
        return DEFAULT_CHARACTER_CONFIG;
      }
    }

    return config;
  };

  /*
   * Read the already saved theme.
   * No theme selector is rendered on this page.
   */
  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");

      if (!theme) {
        return;
      }

      const formattedTheme = theme.charAt(0).toUpperCase() + theme.slice(1);

      setSavedTheme(formattedTheme);
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  async function handleLogout() {
    await logout.mutateAsync();
    navigate("/");
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
          message="Login to view and edit your profile."
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
      {/* ============================================================
          PROFILE PAGE
          ============================================================ */}

      <section className="h-full w-full overflow-hidden bg-background">
        <div className="h-full p-4 lg:p-6">
          <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            {/* ======================================================
                LEFT / MAIN PROFILE
                ====================================================== */}

            <main className="min-h-0 overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                {/* --------------------------------------------------
                    COVER
                    -------------------------------------------------- */}

                <div className="relative h-[190px] shrink-0 overflow-hidden lg:h-[220px]">
                  {/* Main gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#172b67] via-[#253c91] to-[#4b267d]" />

                  {/* Decorative glow */}
                  <div className="absolute -left-20 -top-32 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />

                  <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />

                  <div className="absolute bottom-[-160px] left-[35%] h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />

                  {/* Decorative circles */}
                  <div className="absolute right-[12%] top-[18%] h-28 w-28 rounded-full border border-white/10 bg-white/[0.03]" />

                  <div className="absolute right-[18%] top-[32%] h-12 w-12 rounded-full border border-white/10 bg-white/[0.04]" />

                  <div className="absolute left-[20%] top-[25%] h-20 w-20 rounded-full border border-white/10 bg-white/[0.03]" />

                  {/* Bottom fade */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
                </div>

                {/* --------------------------------------------------
                    PROFILE HEADER
                    -------------------------------------------------- */}

                <div className="relative min-h-0 flex-1 px-5 pb-5 lg:px-7">
                  {/* Avatar + Identity */}
                  <div className="-mt-14 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex min-w-0 items-end gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="rounded-full bg-surface p-1">
                          <ShowcaseAvatar
                            src={currentProfile.avatarUrl}
                            alt={currentProfile.displayName}
                            width={112}
                            height={112}
                          />
                        </div>

                        {/* Online indicator */}
                        <span
                          className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-[3px] border-surface bg-emerald-500"
                          aria-label="Online"
                        />
                      </div>

                      {/* Name */}
                      <div className="min-w-0 pb-1">
                        <div className="flex items-center gap-2">
                          <h1 className="truncate text-2xl font-bold text-ink lg:text-3xl">
                            {currentProfile.displayName}
                          </h1>

                          {currentProfile.role &&
                          currentProfile.role !== "user" ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-[10px] font-semibold text-brand">
                              <Shield className="h-3 w-3" />
                              {currentProfile.role}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 truncate text-sm text-ink-muted">
                          @{currentProfile.username}
                        </p>
                      </div>
                    </div>

                    {/* Edit */}
                    <Button
                      type="button"
                      onClick={openEditor}
                      className="shrink-0"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>

                  {/* ------------------------------------------------
                      PROFILE META
                      ------------------------------------------------ */}

                  <div className="mt-4 flex shrink-0 flex-wrap gap-2">
                    {currentProfile.region ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-background px-3 py-1.5 text-xs text-ink-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {currentProfile.city
                          ? `${currentProfile.city}, ${currentProfile.region}`
                          : currentProfile.region}
                      </div>
                    ) : null}

                    {currentProfile.ageGroup ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-background px-3 py-1.5 text-xs text-ink-muted">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {currentProfile.ageGroup}
                      </div>
                    ) : null}

                    {currentProfile.primaryLanguage ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-background px-3 py-1.5 text-xs text-ink-muted">
                        <Globe className="h-3.5 w-3.5" />
                        {currentProfile.primaryLanguage}
                      </div>
                    ) : null}
                  </div>

                  {/* ------------------------------------------------
                      CONTENT GRID
                      ------------------------------------------------ */}

                  <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                    {/* LEFT CONTENT */}
                    <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
                      {/* About Me */}
                      <div className="shrink-0 rounded-xl border border-line bg-background/40 p-4 lg:p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-brand" />

                          <h2 className="font-semibold text-ink">About Me</h2>
                        </div>

                        <p className="line-clamp-4 text-sm leading-6 text-ink-muted">
                          {currentProfile.bio?.trim()
                            ? currentProfile.bio
                            : "No bio added yet."}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="min-h-0 flex-1 rounded-xl border border-line bg-background/40 p-4 lg:p-5">
                        <h2 className="mb-3 font-semibold text-ink">Stats</h2>

                        <div className="flex h-[calc(100%-32px)] min-h-[100px] items-center justify-center rounded-lg border border-dashed border-line">
                          <span className="text-sm text-ink-muted">
                            Comming Soon
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CHARACTER */}
                    <div className="min-h-0 overflow-hidden rounded-xl border border-line bg-background/40 p-4 lg:p-5">
                      <div className="flex h-full min-h-0 flex-col">
                        <div className="flex shrink-0 items-center justify-between">
                          <h2 className="font-semibold text-ink">Character</h2>
                        </div>

                        {/* Character area */}
                        <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-lg bg-gradient-to-b from-background/40 to-background">
                          {/* Character glow */}
                          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />

                          {/* Character 3D scene */}
                          <div className="absolute inset-0">
                            <Canvas
                              camera={{ position: [0, 1.8, 4.5], fov: 40 }}
                              className="h-full w-full"
                            >
                              <ambientLight intensity={0.7} />
                              <directionalLight
                                position={[4, 8, 5]}
                                intensity={1.4}
                              />
                              <Suspense fallback={null}>
                                <Avatar
                                  config={getCharacterConfig(
                                    profile.characterConfig,
                                  )}
                                  scale={0.8}
                                />
                              </Suspense>
                            </Canvas>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* ======================================================
                RIGHT SIDEBAR
                ====================================================== */}

            <aside className="flex min-h-0 flex-col gap-4 overflow-hidden">
              {/* --------------------------------------------------
                  PROFILE SETTINGS / DETAILS
                  -------------------------------------------------- */}

              <div className="shrink-0 rounded-2xl border border-line bg-surface p-4">
                <h2 className="mb-3 text-base font-semibold text-ink">
                  Profile Settings
                </h2>

                <div className="space-y-2.5">
                  {/* Display Name */}
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                      <UserRound className="h-4 w-4 text-ink-muted" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink">
                        Display Name
                      </p>
                      <p className="truncate text-[11px] text-ink-muted">
                        {currentProfile.displayName}
                      </p>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                      <UserRound className="h-4 w-4 text-ink-muted" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink">Username</p>
                      <p className="truncate text-[11px] text-ink-muted">
                        @{currentProfile.username}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {currentProfile.region ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <MapPin className="h-4 w-4 text-ink-muted" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink">Location</p>
                        <p className="truncate text-[11px] text-ink-muted">
                          {currentProfile.city
                            ? `${currentProfile.city}, ${currentProfile.region}`
                            : currentProfile.region}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Age */}
                  {currentProfile.ageGroup ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <CalendarDays className="h-4 w-4 text-ink-muted" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-ink">
                          Age Group
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {currentProfile.ageGroup}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Gender */}
                  {currentProfile.gender ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <UserRound className="h-4 w-4 text-ink-muted" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-ink">Gender</p>
                        <p className="text-[11px] capitalize text-ink-muted">
                          {currentProfile.gender}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* --------------------------------------------------
                  TOLI
                  -------------------------------------------------- */}

              <div className="shrink-0 rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background">
                    <Users className="h-5 w-5 text-brand" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-ink">Toli</h2>

                    <p className="mt-0.5 text-xs text-ink-muted">Coming soon</p>
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------
                  APPEARANCE
                  -------------------------------------------------- */}

              <div className="shrink-0 rounded-2xl border border-line bg-surface p-5">
                <h2 className="mb-4 text-lg font-semibold text-ink">
                  Appearance
                </h2>

                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background">
                    <Palette className="h-5 w-5 text-ink-muted" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-ink">Theme</p>

                    <p className="text-xs text-ink-muted">{savedTheme}</p>
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------
                  PREFERENCES
                  -------------------------------------------------- */}

              <div className="shrink-0 rounded-2xl border border-line bg-surface p-5">
                <h2 className="mb-4 text-lg font-semibold text-ink">
                  Preferences
                </h2>

                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background">
                    <Globe className="h-5 w-5 text-ink-muted" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Language</p>

                    <p className="truncate text-xs text-ink-muted">
                      {currentProfile.primaryLanguage || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------
                  LOGOUT
                  -------------------------------------------------- */}

              {/* <div className="mt-auto shrink-0">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4" />

                  {logout.isPending ? "Logging out..." : "Log out"}
                </Button>
              </div> */}
            </aside>
          </div>
        </div>
      </section>

      {/* ============================================================
          EDIT PROFILE SHEET
          ============================================================ */}

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
              {/* Display name */}
              <Label className="grid gap-2">
                <span>Display name</span>

                <Input
                  value={form.displayName}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            displayName: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </Label>

              {/* Username */}
              <Label className="grid gap-2">
                <span>Username</span>

                <Input
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            username: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </Label>

              {/* Gender */}
              <Label className="grid gap-2">
                <span>Gender</span>

                <Select
                  value={form.gender}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            gender: event.target
                              .value as CharacterConfig["gender"],
                          }
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

              {/* Character colors */}
              <div className="grid grid-cols-3 gap-3">
                <Label className="grid gap-2">
                  <span>Skin</span>

                  <Input
                    type="color"
                    value={form.skinColor}
                    onChange={(event) =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              skinColor: event.target.value,
                            }
                          : current,
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
                        current
                          ? {
                              ...current,
                              hairColor: event.target.value,
                            }
                          : current,
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
                        current
                          ? {
                              ...current,
                              outfitColor: event.target.value,
                            }
                          : current,
                      )
                    }
                    className="h-10 cursor-pointer p-1"
                  />
                </Label>
              </div>

              {/* DOB */}
              <Label className="grid gap-2">
                <span>Date of birth</span>

                <Input
                  type="date"
                  value={form.dob}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            dob: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </Label>

              {/* Region */}
              <Label className="grid gap-2">
                <span>Region</span>

                <Select
                  value={form.region}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            region: event.target.value,
                          }
                        : current,
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

              {/* City */}
              <Label className="grid gap-2">
                <span>City</span>

                <Select
                  value={form.city}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            city: event.target.value,
                          }
                        : current,
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

              {/* Primary language */}
              <Label className="grid gap-2">
                <span>Primary language</span>

                <Select
                  value={form.primaryLanguage}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            primaryLanguage: event.target.value,
                          }
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

              {/* Languages */}
              <Label className="grid gap-2">
                <span>Languages</span>

                <Input
                  value={form.languages}
                  placeholder="English, Spanish"
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            languages: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </Label>

              {/* Bio */}
              <Label className="grid gap-2">
                <span>Bio</span>

                <Textarea
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            bio: event.target.value,
                          }
                        : current,
                    )
                  }
                  rows={4}
                />
              </Label>

              {/* Error */}
              {updateProfile.isError ? (
                <p className="rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
                  Could not save profile. Please check the fields and try again.
                </p>
              ) : null}

              {/* Actions */}
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
                  onClick={() => {
                    setOpen(false);
                    setForm(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          {/* Sheet logout */}
          <div className="mt-6 border-t border-line pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4" />

              {logout.isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
