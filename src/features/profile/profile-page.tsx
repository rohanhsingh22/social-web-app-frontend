import { Suspense, useEffect, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  Ban,
  Cake,
  CalendarDays,
  Clock,
  Copy,
  Check,
  Flag,
  Globe,
  Heart,
  Languages,
  MapPin,
  Palette,
  Pencil,
  Shield,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { useMyProfile, usePublicProfile, useUpdateMyProfile } from "@/features/profile/api";
import { useSearchUsersQuery } from "@/rtk/users/users-api";
import {
  useAcceptRequestMutation,
  useCancelRequestMutation,
  useCreateConnectionRequestMutation,
  useRejectRequestMutation,
} from "@/rtk/connections/connections-api";
import {
  useBlockUserMutation,
  useBlocksQuery,
  useUnblockUserMutation,
} from "@/rtk/safety/safety-api";
import {
  ReportDialog,
  type ReportTarget,
} from "@/components/safety/report-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { CharacterAvatar } from "@/components/character/avatar";
import { Canvas } from "@react-three/fiber";
import { UserThoughts } from "@/features/thoughts/user-thoughts";
import { UserAvatar } from "@/components/common/user-avatar";
import { ToliBadge } from "@/components/toli/toli-badge";
import { resolveToliAvatarImage } from "@/lib/toli-avatar";
import { cn } from "@/lib/utils";

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
  interests: string;
};

function formatDateOnly(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  // Backend sends ISO (dob is a DATE column). Parse as UTC date-only so the
  // day never shifts with the viewer's timezone.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  const formatted = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return formatted || null;
}

function formatMonthYear(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) {
    return null;
  }
  return new Date(time).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
}

function ChipList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyText}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-ink"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function EditSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-[#5B3FF5] text-xs font-black text-white shadow-md shadow-brand/25">
          {step}
        </span>
        <div>
          <h3 className="text-[15px] font-extrabold text-ink">{title}</h3>
          <p className="text-xs text-ink-subtle">{description}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function EditField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Label className="grid gap-1.5">
      <span className="text-[13px] font-bold text-ink">{label}</span>
      {children}
      {hint ? (
        <span className="text-[11px] text-ink-subtle">{hint}</span>
      ) : null}
    </Label>
  );
}

function formatFriendship(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const elapsed = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    return null;
  }
  const days = Math.floor(elapsed / 86400000);
  if (days <= 0) {
    return "Connected today";
  }
  return `Friends for ${days} day${days === 1 ? "" : "s"}`;
}

function normalizeList(value: string): string {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .join(",");
}

function isProfileFormDirty(
  form: ProfileFormState,
  profile: Profile,
  config: CharacterConfig,
): boolean {
  if (form.displayName.trim() !== profile.displayName) {
    return true;
  }
  if (form.username.trim() !== profile.username) {
    return true;
  }
  if (form.bio.trim() !== (profile.bio ?? "").trim()) {
    return true;
  }
  if (form.dob !== (profile.dob ?? "").slice(0, 10)) {
    return true;
  }
  if (form.region !== (profile.region ?? "")) {
    return true;
  }
  if (form.city !== (profile.city ?? "")) {
    return true;
  }
  if (form.gender !== config.gender) {
    return true;
  }
  if (
    form.skinColor !==
    (config.skinColor ?? DEFAULT_CHARACTER_CONFIG.skinColor)
  ) {
    return true;
  }
  if (
    form.hairColor !==
    (config.hairColor ?? DEFAULT_CHARACTER_CONFIG.hairColor)
  ) {
    return true;
  }
  if (
    form.outfitColor !==
    (config.outfitColor ?? DEFAULT_CHARACTER_CONFIG.outfitColor)
  ) {
    return true;
  }
  if (form.primaryLanguage !== (profile.primaryLanguage ?? "")) {
    return true;
  }
  if (normalizeList(form.languages) !== normalizeList(profile.languages.join(","))) {
    return true;
  }
  if (normalizeList(form.interests) !== normalizeList(profile.interests.join(","))) {
    return true;
  }
  return false;
}

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
    interests: profile.interests.join(", "),
  };
}

type ProfileTab = "about" | "thoughts" | "avatar";

export function ProfilePage() {
  const navigate = useNavigate();
  const { publicUserId } = useParams<{ publicUserId?: string }>();

  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const sessionPublicId = authQuery.data?.user?.publicUserId;
  // Own profile via /profile OR via your own /profile/:publicUserId link:
  // either way there is never a Connect button for yourself.
  const isOwnProfile =
    !publicUserId ||
    (Boolean(sessionPublicId) &&
      publicUserId.toUpperCase() === sessionPublicId!.toUpperCase());

  const ownProfileQuery = useMyProfile(isLoggedIn && isOwnProfile);
  const publicProfileQuery = usePublicProfile(
    publicUserId ?? "",
    isLoggedIn && !isOwnProfile,
  );
  const profileQuery = isOwnProfile ? ownProfileQuery : publicProfileQuery;
  const updateProfile = useUpdateMyProfile();

  const profile = profileQuery.data ?? authQuery.data?.profile;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [pictureOpen, setPictureOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>("about");

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

  useEffect(() => {
    setProfileTab("about");
  }, [publicUserId]);

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
  const effectiveConfig = getCharacterConfig(profile.characterConfig);
  const formHasChanges = form
    ? isProfileFormDirty(form, currentProfile, effectiveConfig)
    : false;
  const toliPictureKey =
    currentProfile.profilePicture?.type === "toli"
      ? currentProfile.profilePicture.toliAvatarKey
      : null;
  const fullPictureSrc = toliPictureKey
    ? resolveToliAvatarImage(toliPictureKey)
    : currentProfile.avatarUrl;

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

      interests: form.interests
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

      <section className="chat-scrollbar h-full w-full overflow-hidden bg-background lg:overflow-y-auto">
        <div className="h-full p-4 lg:p-6">
          <div className={cn("grid h-full min-h-0 grid-cols-1 gap-5", isOwnProfile ? "lg:grid-cols-[minmax(0,1fr)_420px]" : "lg:grid-cols-1")}>
            {/* ======================================================
                LEFT / MAIN PROFILE
                ====================================================== */}

            <main className="rounded-[1.75rem] border border-line bg-surface/80 shadow-sm backdrop-blur">
              <div className="flex flex-col">
                {/* --------------------------------------------------
                    COVER
                    -------------------------------------------------- */}

                <div className="relative h-52 shrink-0 overflow-hidden rounded-t-[1.75rem] lg:h-60">
                  {/* Main gradient */}
                  <div className="absolute inset-0 bg-linear-to-br from-[#172b67] via-[#253c91] to-[#4b267d]" />

                  {/* Decorative glow */}
                  <div className="orb-drift absolute -left-20 -top-32 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />

                  <div
                    className="orb-drift absolute -right-20 top-0 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl"
                    style={{ animationDelay: "-4s" }}
                  />

                  <div className="absolute -bottom-40 left-[35%] h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />

                  {/* Decorative circles */}
                  <div className="absolute right-[12%] top-[18%] h-28 w-28 rounded-full border border-white/10 bg-white/3" />

                  <div className="absolute right-[18%] top-[32%] h-12 w-12 rounded-full border border-white/10 bg-white/4" />

                  <div className="absolute left-[20%] top-[25%] h-20 w-20 rounded-full border border-white/10 bg-white/3" />

                  {/* Bottom fade */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-surface to-transparent" />
                </div>

                {/* --------------------------------------------------
                    PROFILE HEADER
                    -------------------------------------------------- */}

                <div className="relative px-5 pb-5 lg:px-7">
                  {/* Avatar + Identity */}
                  <div className="-mt-16 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex min-w-0 items-end gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setPictureOpen(true)}
                          aria-label={`View ${currentProfile.displayName}'s profile picture`}
                          className="cursor-pointer rounded-full bg-gradient-to-br from-brand via-[#5B3FF5] to-[#D94FE8] p-[3px] shadow-xl shadow-brand/20 outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <span className="block rounded-full bg-surface p-[3px]">
                            <UserAvatar
                              user={currentProfile}
                              size={120}
                            />
                          </span>
                        </button>

                        {/* Online indicator */}
                        <span
                          className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-surface bg-emerald-500"
                          aria-label="Online"
                        />
                      </div>

                      {/* Name */}
                      <div className="min-w-0 pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink lg:text-[32px]">
                            {currentProfile.displayName}
                          </h1>

                          {currentProfile.role &&
                          currentProfile.role !== "user" ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-[10px] font-bold text-brand">
                              <Shield className="h-3 w-3" />
                              {currentProfile.role}
                            </span>
                          ) : null}

                          {currentProfile.toli ? (
                            <ToliBadge
                              name={currentProfile.toli.name}
                              className="shrink-0"
                            />
                          ) : null}
                        </div>

                        <HirotoliIdCopy
                          publicUserId={currentProfile.publicUserId}
                          username={currentProfile.username}
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>

                    {isOwnProfile ? (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          onClick={openEditor}
                          className="rounded-full px-5 shadow-md shadow-brand/25"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Profile
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/settings")}
                          className="rounded-full"
                        >
                          Settings
                        </Button>
                      </div>
                    ) : publicUserId ? (
                      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                        <ConnectionWidget publicUserId={publicUserId} />
                        <ProfileSafetyRow
                          publicUserId={publicUserId}
                          username={currentProfile.username}
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* ------------------------------------------------
                      PROFILE META
                      ------------------------------------------------ */}

                  <div className="mt-4 flex shrink-0 flex-wrap gap-2">
                    {currentProfile.region ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-brand" />
                        {currentProfile.city
                          ? `${currentProfile.city}, ${currentProfile.region}`
                          : currentProfile.region}
                      </div>
                    ) : null}

                    {currentProfile.ageGroup ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm">
                        <CalendarDays className="h-3.5 w-3.5 text-brand" />
                        {currentProfile.ageGroup}
                      </div>
                    ) : null}

                    {currentProfile.gender ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium capitalize text-ink-muted shadow-sm">
                        <UserRound className="h-3.5 w-3.5 text-brand" />
                        {currentProfile.gender}
                      </div>
                    ) : null}

                    {formatDateOnly(currentProfile.dob) ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm">
                        <Cake className="h-3.5 w-3.5 text-brand" />
                        {formatDateOnly(currentProfile.dob)}
                      </div>
                    ) : null}

                    {currentProfile.primaryLanguage ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm">
                        <Globe className="h-3.5 w-3.5 text-brand" />
                        {currentProfile.primaryLanguage}
                      </div>
                    ) : null}

                    {formatMonthYear(currentProfile.createdAt) ? (
                      <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm">
                        <Clock className="h-3.5 w-3.5 text-brand" />
                        Joined {formatMonthYear(currentProfile.createdAt)}
                      </div>
                    ) : null}
                  </div>

                  {/* Profile tabs */}
                  <div className="mt-5 flex shrink-0 gap-1 overflow-x-auto border-b border-line [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Profile sections">
                    {(
                      [
                        { id: "about", label: "About" },
                        { id: "thoughts", label: "Thoughts" },
                        ...((isOwnProfile || currentProfile.characterConfig)
                          ? [{ id: "avatar", label: "Avatar" }]
                          : []),
                      ] as { id: ProfileTab; label: string }[]
                    ).map((option) => {
                      const selected = profileTab === option.id;
                      return (
                        <button
                          key={option.id}
                          role="tab"
                          aria-selected={selected}
                          type="button"
                          onClick={() => setProfileTab(option.id)}
                          className="relative shrink-0 px-4 py-3 text-[15px] outline-none transition-colors hover:bg-surface-hover/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                        >
                          <span
                            className={
                              selected
                                ? "font-bold text-ink"
                                : "font-medium text-ink-muted"
                            }
                          >
                            {option.label}
                          </span>
                          {selected ? (
                            <span
                              aria-hidden
                              className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-brand"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* ------------------------------------------------
                      CONTENT GRID
                      ------------------------------------------------ */}

                  <div key={profileTab} className="feed-item mt-4">
                    {profileTab === "about" ? (
                      <div className="grid gap-4">
                      {/* About Me */}
                      <div className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-sm">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                            <UserRound className="h-4 w-4" aria-hidden />
                          </span>
                          <h2 className="font-extrabold text-ink">About</h2>
                        </div>

                        <p className="text-sm leading-6 text-ink-muted">
                          {currentProfile.bio?.trim()
                            ? currentProfile.bio
                            : isOwnProfile
                              ? "No bio added yet."
                              : "Not shared."}
                        </p>
                      </div>

                      {/* Languages */}
                      <div className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                            <Languages className="h-4 w-4" aria-hidden />
                          </span>
                          <h2 className="font-extrabold text-ink">Languages</h2>
                        </div>

                        <ChipList
                          items={
                            currentProfile.primaryLanguage
                              ? [
                                  currentProfile.primaryLanguage,
                                  ...currentProfile.languages.filter(
                                    (language) =>
                                      language !==
                                      currentProfile.primaryLanguage,
                                  ),
                                ]
                              : currentProfile.languages
                          }
                          emptyText={
                            isOwnProfile
                              ? "Add languages you speak from Edit Profile."
                              : "Not shared."
                          }
                        />
                      </div>

                      {/* Interests */}
                      <div className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                            <Heart className="h-4 w-4" aria-hidden />
                          </span>
                          <h2 className="font-extrabold text-ink">Interests</h2>
                        </div>

                        <ChipList
                          items={currentProfile.interests}
                          emptyText={
                            isOwnProfile
                              ? "Add your interests from Edit Profile."
                              : "Not shared."
                          }
                        />
                      </div>

                      </div>
                    ) : null}

                    {profileTab === "thoughts" ? (
                      <UserThoughts
                        publicUserId={currentProfile.publicUserId}
                        isOwn={isOwnProfile}
                      />
                    ) : null}

                    {/* AVATAR — hidden on others' profiles when the owner
                        keeps it private (backend nulls it) or unset, rather
                        than showing a default mannequin. */}
                    {profileTab === "avatar" &&
                    (isOwnProfile || currentProfile.characterConfig) ? (
                      <div className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-sm">
                        <div className="relative h-96 overflow-hidden bg-linear-to-b from-background to-surface-muted">
                          <div
                            aria-hidden
                            className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
                          />
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
                                <CharacterAvatar
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
                    ) : null}
                  </div>
                </div>
              </div>
            </main>

            {/* ======================================================
                RIGHT SIDEBAR
                ====================================================== */}

            {isOwnProfile ? (
            <aside className="flex flex-col gap-4">
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

                  {/* HiRotoli ID (replaces the username row) */}
                  {currentProfile.publicUserId ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <UserRound className="h-4 w-4 text-ink-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink">
                          HiRotoli ID
                        </p>
                        <HirotoliIdCopy
                          publicUserId={currentProfile.publicUserId}
                          className="text-[11px]"
                        />
                      </div>
                    </div>
                  ) : null}

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

                  {/* Birthday */}
                  {formatDateOnly(currentProfile.dob) ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <Cake className="h-4 w-4 text-ink-muted" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-ink">Birthday</p>
                        <p className="text-[11px] text-ink-muted">
                          {formatDateOnly(currentProfile.dob)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Languages */}
                  {currentProfile.languages.length > 0 ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <Languages className="h-4 w-4 text-ink-muted" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink">Languages</p>
                        <p className="truncate text-[11px] text-ink-muted">
                          {currentProfile.languages.join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Interests */}
                  {currentProfile.interests.length > 0 ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <Heart className="h-4 w-4 text-ink-muted" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink">Interests</p>
                        <p className="truncate text-[11px] text-ink-muted">
                          {currentProfile.interests.join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Member since */}
                  {formatMonthYear(currentProfile.createdAt) ? (
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <Clock className="h-4 w-4 text-ink-muted" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-ink">
                          Member since
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {formatMonthYear(currentProfile.createdAt)}
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

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-ink">Toli</h2>

                    {currentProfile.toli ? (
                      <div className="mt-1">
                        <ToliBadge name={currentProfile.toli.name} />
                      </div>
                    ) : (
                      <p className="mt-0.5 text-xs text-ink-muted">
                        No Toli selected
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/settings")}
                  className="mt-3 w-full"
                >
                  Manage Toli
                </Button>
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

            </aside>
            ) : null}
          </div>
        </div>
      </section>

      {/* ============================================================
          PROFILE PICTURE DIALOG (picture only)
          ============================================================ */}

      <Dialog
        open={pictureOpen}
        onOpenChange={(next) => {
          if (!next) {
            setPictureOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-xs">
          <DialogTitle className="sr-only">
            {currentProfile.displayName}&apos;s profile picture
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged profile picture. Close to go back.
          </DialogDescription>
          <div className="flex justify-center py-2">
            {fullPictureSrc ? (
              <img
                src={fullPictureSrc}
                alt={`${currentProfile.displayName}'s profile picture`}
                className="h-64 w-64 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-64 w-64 place-items-center rounded-full bg-brand/10 text-6xl font-bold text-brand">
                {currentProfile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================
          EDIT PROFILE SHEET
          ============================================================ */}

      {isOwnProfile ? (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="overflow-y-auto border-l border-line bg-background p-0 sm:max-w-md"
        >
          {/* Banner header */}
          <div className="relative shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#172b67] via-[#253c91] to-[#4b267d]" />
            <div
              aria-hidden
              className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-purple-500/30 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-blue-400/25 blur-3xl"
            />
            <SheetHeader className="relative p-5 pr-16 pt-14 text-left">
              <SheetTitle className="text-xl font-extrabold leading-snug text-white">
                Edit profile
              </SheetTitle>
              <SheetDescription className="text-white/70">
                Update how you appear across the app.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Live identity preview */}
          {form ? (
            <div className="mt-4 shrink-0 px-4">
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-line bg-surface p-4 shadow-xl shadow-black/5">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl font-black text-white shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${form.outfitColor}, #5B3FF5)`,
                  }}
                  aria-hidden
                >
                  {(form.displayName.trim().charAt(0) || "?").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-extrabold text-ink">
                    {form.displayName.trim() || "Your name"}
                  </p>
                  <p className="truncate font-mono text-xs text-ink-subtle">
                    {currentProfile.publicUserId ??
                      `@${form.username.trim() || currentProfile.username}`}
                  </p>
                </div>
                <span
                  className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: form.skinColor }}
                  title="Skin tone preview"
                />
              </div>
            </div>
          ) : null}

          {form ? (
            <form className="grid gap-4 p-4">
              <EditSection
                step="01"
                title="Identity"
                description="The name and handle people see."
              >
                <EditField label="Display name">
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
                    className="rounded-xl"
                  />
                </EditField>

                <EditField
                  label="Username"
                  hint="Lowercase letters, numbers and underscores."
                >
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
                    className="rounded-xl font-mono"
                  />
                </EditField>

                <EditField label="Gender">
                  <div
                    role="group"
                    aria-label="Gender"
                    className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface-muted/60 p-1.5"
                  >
                    {GENDER_OPTIONS.map((option) => {
                      const selected = form.gender === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setForm((current) =>
                              current
                                ? {
                                    ...current,
                                    gender: option.value as CharacterConfig["gender"],
                                  }
                                : current,
                            )
                          }
                          className={[
                            "rounded-xl px-3 py-2.5 text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand",
                            selected
                              ? "bg-surface text-ink shadow-md"
                              : "text-ink-subtle hover:text-ink",
                          ].join(" ")}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </EditField>
              </EditSection>

              <EditSection
                step="02"
                title="Character colors"
                description="Skin, hair and outfit for your 3D avatar."
              >
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { key: "skinColor", label: "Skin" },
                      { key: "hairColor", label: "Hair" },
                      { key: "outfitColor", label: "Outfit" },
                    ] as const
                  ).map((option) => (
                    <Label key={option.key} className="grid gap-2">
                      <span className="text-[13px] font-bold text-ink">
                        {option.label}
                      </span>
                      <span
                        className="grid h-16 place-items-center overflow-hidden rounded-2xl border border-line transition-transform hover:scale-[1.03]"
                        style={{ backgroundColor: form[option.key] }}
                      >
                        <span className="rounded-full bg-black/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white backdrop-blur-sm">
                          {form[option.key]}
                        </span>
                      </span>
                      <Input
                        type="color"
                        aria-label={`${option.label} color`}
                        value={form[option.key]}
                        onChange={(event) =>
                          setForm((current) =>
                            current
                              ? {
                                  ...current,
                                  [option.key]: event.target.value,
                                }
                              : current,
                          )
                        }
                        className="h-9 w-full cursor-pointer rounded-xl border-line p-1"
                      />
                    </Label>
                  ))}
                </div>
              </EditSection>

              <EditSection
                step="03"
                title="Details"
                description="Age and where you are in the world."
              >
                <EditField label="Date of birth">
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
                    className="rounded-xl"
                  />
                </EditField>

                <div className="grid grid-cols-2 gap-3">
                  <EditField label="Region">
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
                  </EditField>

                  <EditField label="City">
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
                  </EditField>
                </div>
              </EditSection>

              <EditSection
                step="04"
                title="Languages & interests"
                description="Help people find common ground with you."
              >
                <EditField label="Primary language">
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
                </EditField>

                <EditField label="Languages" hint="Comma separated">
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
                    className="rounded-xl"
                  />
                </EditField>

                <EditField label="Interests" hint="Comma separated">
                  <Input
                    value={form.interests}
                    placeholder="Music, Gaming, Art"
                    onChange={(event) =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              interests: event.target.value,
                            }
                          : current,
                      )
                    }
                    className="rounded-xl"
                  />
                </EditField>
              </EditSection>

              <EditSection
                step="05"
                title="Bio"
                description="A few lines about you."
              >
                <Textarea
                  value={form.bio}
                  aria-label="Bio"
                  placeholder="Tell people who you are..."
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
                  className="rounded-2xl"
                />
              </EditSection>

              {/* Error */}
              {updateProfile.isError ? (
                <p className="rounded-2xl border border-danger bg-danger-soft p-3 text-sm font-medium text-danger-ink">
                  Could not save profile. Please check the fields and try again.
                </p>
              ) : null}

              {/* Sticky actions */}
              <div className="sticky bottom-0 -mx-4 mt-2 border-t border-line bg-background/90 px-4 py-3 backdrop-blur-md">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setForm(null);
                    }}
                    className="flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={saveProfile}
                    disabled={updateProfile.isPending || !formHasChanges}
                    title={formHasChanges ? undefined : "No changes to save"}
                    className="flex-[2] rounded-full shadow-lg shadow-brand/25 disabled:shadow-none"
                  >
                    {updateProfile.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </form>
          ) : null}

          <div className="h-4" aria-hidden />
        </SheetContent>
      </Sheet>
      ) : null}
    </AppShell>
  );
}

function HirotoliIdCopy({
  publicUserId,
  username,
  className,
}: {
  publicUserId?: string | null;
  username?: string | null;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const id = publicUserId ?? (username ? `@${username}` : null);

  if (!id) {
    return null;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(id!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="truncate font-mono">{id}</span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy HiRotoli ID"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-subtle transition hover:bg-surface-hover hover:text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </span>
  );
}

// Connection states for OTHER users' profiles. Never renders for yourself:
// callers gate on isOwnProfile and this double-checks the session identity.
function ConnectionWidget({ publicUserId }: { publicUserId: string }) {
  // Like the connections lists, this polls lightly + refetches on mount:
  // the peer's actions (cancel/accept) arrive with no socket push yet.
  const searchQuery = useSearchUsersQuery(publicUserId, {
    pollingInterval: 10_000,
    refetchOnMountOrArgChange: true,
  });
  const [createRequest, createState] = useCreateConnectionRequestMutation();
  const [acceptRequest, acceptState] = useAcceptRequestMutation();
  const [rejectRequest, rejectState] = useRejectRequestMutation();
  const [cancelRequest, cancelState] = useCancelRequestMutation();
  const [error, setError] = useState<string | null>(null);

  const authQuery = useAuthSession();
  const sessionPublicId = authQuery.data?.user?.publicUserId;
  const isSelf =
    Boolean(sessionPublicId) &&
    publicUserId.toUpperCase() === sessionPublicId!.toUpperCase();

  const connection = searchQuery.data?.users[0]?.connection ?? null;
  const busy =
    createState.isLoading ||
    acceptState.isLoading ||
    rejectState.isLoading ||
    cancelState.isLoading ||
    searchQuery.isFetching;

  async function run(
    action: () => Promise<unknown>,
    fallbackError: string,
  ) {
    setError(null);
    try {
      await action();
      // accept/reject/cancel only invalidate ["Connections"], so refresh the
      // status lookup explicitly (create already invalidates UserSearch too;
      // a second refresh is harmless).
      await searchQuery.refetch();
    } catch {
      setError(fallbackError);
      await searchQuery.refetch();
    }
  }

  const loading = searchQuery.isLoading && !connection;

  // Never show connection actions for yourself (e.g. opening your own
  // /profile/:publicUserId link).
  if (isSelf) {
    return null;
  }

  if (loading) {
    return (
      <Button type="button" variant="outline" disabled className="shrink-0">
        Loading...
      </Button>
    );
  }

  // No row, or a dead row (declined/cancelled/blocked) — a fresh request
  // reuses the row server-side.
  if (
    !connection ||
    connection.status === "rejected" ||
    connection.status === "cancelled" ||
    connection.status === "blocked"
  ) {
    return (
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <Button
          type="button"
          disabled={busy}
          className="rounded-full px-6 shadow-md shadow-brand/25"
          onClick={() =>
            void run(
              () => createRequest({ receiverUserId: publicUserId }).unwrap(),
              "Could not send the request. Please try again.",
            )
          }
        >
          {createState.isLoading ? "Sending..." : "Connect"}
        </Button>
        {error ? (
          <p className="max-w-55 text-right text-xs text-red-400">{error}</p>
        ) : null}
      </div>
    );
  }

  if (connection.status === "accepted") {
    const duration = formatFriendship(
      connection.updatedAt ?? connection.createdAt,
    );
    const since = formatMonthYear(
      connection.updatedAt ?? connection.createdAt ?? undefined,
    );
    return (
      <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-500">
          <BadgeCheck className="h-4 w-4" aria-hidden />
          Connected
        </span>
        {duration || since ? (
          <p className="text-[11px] text-ink-subtle">
            {duration}
            {duration && since ? " · " : ""}
            {since ? `since ${since}` : ""}
          </p>
        ) : null}
      </div>
    );
  }

  // Pending request.
  if (connection.direction === "received") {
    return (
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={busy}
            className="shrink-0 rounded-full"
            onClick={() =>
              void run(
                () => acceptRequest(connection.id).unwrap(),
                "Could not accept the request. Please try again.",
              )
            }
          >
            {acceptState.isLoading ? "Accepting..." : "Accept"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            className="shrink-0 rounded-full"
            onClick={() =>
              void run(
                () => rejectRequest(connection.id).unwrap(),
                "Could not decline the request. Please try again.",
              )
            }
          >
            Decline
          </Button>
        </div>
        <p className="text-[11px] text-ink-subtle">
          Wants to connect with you
        </p>
        {error ? (
          <p className="max-w-55 text-right text-xs text-red-400">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-muted">
        <Check className="h-4 w-4" aria-hidden />
        Request sent
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          void run(
            () => cancelRequest(connection.id).unwrap(),
            "Could not cancel the request. Please try again.",
          )
        }
        className="inline-flex items-center gap-1 text-[11px] text-ink-subtle transition-colors hover:text-ink disabled:opacity-50"
      >
        <X className="h-3 w-3" aria-hidden />
        {cancelState.isLoading ? "Cancelling..." : "Cancel request"}
      </button>
      {error ? (
        <p className="max-w-55 text-right text-xs text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

function ProfileSafetyRow({
  publicUserId,
  username,
}: {
  publicUserId: string;
  username: string;
}) {
  const blocksQuery = useBlocksQuery();
  const [blockUser, blockState] = useBlockUserMutation();
  const [unblockUser, unblockState] = useUnblockUserMutation();
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Best-effort match: the blocks list carries internal ids, so fall back to
  // username. Server state is authoritative; the toggle self-corrects.
  const blocked = (blocksQuery.data ?? []).some(
    (entry) => entry.blockedUser.profile?.username === username,
  );
  const busy = blockState.isLoading || unblockState.isLoading;

  async function handleBlock() {
    setError(null);
    try {
      await blockUser({ blockedUserId: publicUserId }).unwrap();
    } catch {
      setError("Could not block this user. Please try again.");
    }
  }

  async function handleUnblock() {
    setError(null);
    try {
      await unblockUser(publicUserId).unwrap();
    } catch {
      setError("Could not unblock this user. Please try again.");
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setReportTarget({ targetUserId: publicUserId })}
          className="inline-flex items-center gap-1 text-[11px] text-ink-subtle transition-colors hover:text-ink"
        >
          <Flag className="h-3 w-3" aria-hidden />
          Report
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void (blocked ? handleUnblock() : handleBlock())}
          className="inline-flex items-center gap-1 text-[11px] text-ink-subtle transition-colors hover:text-ink disabled:opacity-50"
        >
          <Ban className="h-3 w-3" aria-hidden />
          {blockState.isLoading
            ? "Blocking..."
            : unblockState.isLoading
              ? "Unblocking..."
              : blocked
                ? "Unblock"
                : "Block"}
        </button>
      </div>
      {error ? (
        <p className="max-w-55 text-right text-xs text-red-400">{error}</p>
      ) : null}
      <ReportDialog
        target={reportTarget}
        title="Report this user"
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}


