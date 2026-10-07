import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gamepad2,
  Globe,
  Info,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Palette,
  RefreshCcw,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
  Users,
  Settings2,
  Sparkles,
  CircleUserRound,
  SlidersHorizontal,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { LockedPanel } from "@/components/common/locked-panel";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import {
  useAuthSession,
  useLogout,
} from "@/features/auth/api";

import { useMyProfile } from "@/features/profile/api";
import {
  useTolisQuery,
  useSelectToliMutation,
} from "@/features/toli/api";
import { useUpdateProfilePictureMutation } from "@/rtk/profile/profile-api";
import {
  useCharactersQuery,
  useMyCharacterQuery,
  useSaveCharacterMutation,
} from "@/rtk/character/character-api";
import { CharacterPicker } from "@/features/character/character-picker";
import { WardrobePicker } from "@/features/character/wardrobe-picker";
import { ToliBadge } from "@/components/toli/toli-badge";
import { ToliPicker } from "@/features/toli/toli-picker";
import {
  ToliAvatarPicker,
  PROVIDER_AVATAR_VALUE,
} from "@/features/toli/toli-avatar-picker";

import {
  useSettingsQuery,
  useUpdateSettingsMutation,
  type ThemePreference,
  type ProfileVisibility,
} from "@/rtk/settings/settings-api";
import {
  useBlocksQuery,
  useUnblockUserMutation,
} from "@/rtk/safety/safety-api";
import { HirotoliId } from "@/components/common/hirotoli-id";
import { UserAvatar } from "@/components/common/user-avatar";

import {
  setThemeMode,
  setThemeAccent,
} from "@/store/ui-slice";

import type { AppDispatch } from "@/store/store";

import {
  accentOptions,
} from "@/lib/theme";


/* =========================================================
   TYPES
========================================================= */

type SectionId =
  | "appearance"
  | "character"
  | "toli"
  | "privacy"
  | "account";

const VISIBILITY_KEYS = [
  "avatar",
  "bio",
  "dob",
  "age",
  "gender",
  "region",
  "city",
  "primaryLanguage",
  "languages",
  "interests",
] as const satisfies readonly (keyof ProfileVisibility)[];

const DEFAULT_VISIBILITY: ProfileVisibility = {
  avatar: true,
  bio: true,
  dob: true,
  age: true,
  gender: true,
  region: true,
  city: true,
  primaryLanguage: true,
  languages: true,
  interests: true,
};


/* =========================================================
   SETTINGS NAVIGATION
========================================================= */

const settingSections: {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof Palette;
}[] = [
  {
    id: "appearance",
    label: "Display",
    description: "Theme & accent",
    icon: Palette,
  },
  {
    id: "character",
    label: "Character",
    description: "3D home identity",
    icon: Sparkles,
  },
  {
    id: "toli",
    label: "My Toli",
    description: "Clan & avatar",
    icon: Gamepad2,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Visibility shield",
    icon: ShieldCheck,
  },
  {
    id: "account",
    label: "Account",
    description: "Profile & session",
    icon: CircleUserRound,
  },
];


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof User;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-ink">
        {eyebrow}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h2 className="bg-gradient-to-r from-ink via-ink to-brand-ink bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          {title}
        </h2>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand shadow-lg shadow-brand/25">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-1.5 max-w-lg text-sm text-ink-muted">
        {description}
      </p>
    </div>
  );
}


/* =========================================================
   SETTINGS ROW
========================================================= */

function SettingsRow({
  icon: Icon,
  title,
  description,
  children,
  danger = false,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors hover:bg-surface-muted/70">
      <div
        className={[
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
          danger
            ? "bg-danger-soft text-danger-ink"
            : "bg-gradient-to-br from-surface-muted to-surface-hover text-ink-subtle",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm font-bold",
            danger ? "text-danger-ink" : "text-ink",
          ].join(" ")}
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-ink-subtle">
          {description}
        </p>
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}


/* =========================================================
   THEME PREVIEW MOCKUP + OPTION
========================================================= */

function ThemeMock({ mode }: { mode: "light" | "dark" | "split" }) {
  const light = (
    <div className="flex flex-1 flex-col gap-1 bg-[#f6f7fb] p-1.5">
      <div className="h-1.5 w-3/4 rounded-full bg-[#1a1c2e]" />
      <div className="h-1.5 w-full rounded-full bg-[#cdd3e0]" />
      <div className="h-1.5 w-2/3 rounded-full bg-[#cdd3e0]" />
      <div className="mt-auto h-2.5 w-8 self-end rounded-full bg-[#ff2e63]" />
    </div>
  );
  const dark = (
    <div className="flex flex-1 flex-col gap-1 bg-[#161927] p-1.5">
      <div className="h-1.5 w-3/4 rounded-full bg-white" />
      <div className="h-1.5 w-full rounded-full bg-[#3a4060]" />
      <div className="h-1.5 w-2/3 rounded-full bg-[#3a4060]" />
      <div className="mt-auto h-2.5 w-8 self-end rounded-full bg-[#ff2e63]" />
    </div>
  );

  return (
    <div className="flex h-20 gap-0.5 overflow-hidden rounded-xl border border-line">
      {mode === "dark" ? dark : mode === "split" ? (
        <>
          {light}
          {dark}
        </>
      ) : (
        light
      )}
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  title,
  description,
  mock,
  active,
  onClick,
}: {
  icon: typeof Moon;
  title: string;
  description: string;
  mock: "light" | "dark" | "split";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "relative flex min-h-[112px] flex-1 flex-col gap-3 rounded-2xl border p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.98]",
        active
          ? "border-brand/50 bg-brand-soft/50 shadow-lg shadow-brand/10"
          : "border-line bg-surface/80 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10",
      ].join(" ")}
    >
      {active && (
        <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand text-white shadow-md shadow-brand/30">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      <ThemeMock mode={mock} />

      <div className="flex items-center gap-2">
        <span
          className={[
            "grid h-8 w-8 place-items-center rounded-lg",
            active
              ? "bg-brand text-white"
              : "bg-surface-muted text-ink-subtle",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-bold text-ink">
            {title}
          </span>
          <span className="block text-[11px] text-ink-subtle">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}


/* =========================================================
   COLOR OPTION
========================================================= */

function AccentOption({
  color,
  label,
  selected,
  onClick,
}: {
  color: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className="group flex flex-col items-center gap-2 outline-none"
    >
      <span
        className={[
          "grid h-12 w-12 place-items-center rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          selected
            ? "scale-110 shadow-lg ring-2 ring-brand ring-offset-4 ring-offset-background"
            : "hover:scale-105 hover:shadow-md",
        ].join(" ")}
        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      >
        {selected && (
          <Check className="h-5 w-5 text-white drop-shadow" />
        )}
      </span>

      <span
        className={[
          "text-[11px] font-bold",
          selected ? "text-ink" : "text-ink-subtle",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}


/* =========================================================
   VISIBILITY ITEM
========================================================= */

const VISIBILITY_META: {
  key: keyof ProfileVisibility;
  icon: typeof Eye;
  title: string;
  description: string;
}[] = [
  { key: "avatar", icon: User, title: "Avatar", description: "Profile photo & Toli face" },
  { key: "bio", icon: Info, title: "Bio", description: "Short profile biography" },
  { key: "dob", icon: Calendar, title: "Date of birth", description: "Exact birth date" },
  { key: "age", icon: Shield, title: "Age group", description: "Bracket like 22–25" },
  { key: "gender", icon: Users, title: "Gender", description: "As set on your profile" },
  { key: "region", icon: Globe, title: "Region", description: "Continent-level location" },
  { key: "city", icon: Globe, title: "City", description: "City-level location" },
  { key: "primaryLanguage", icon: Globe, title: "Primary language", description: "Main language" },
  { key: "languages", icon: Globe, title: "Languages", description: "All spoken languages" },
  { key: "interests", icon: Sparkles, title: "Interests", description: "Hobbies & topics" },
];

function VisibilityItem({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: typeof Eye;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border p-3.5 transition-all",
        checked
          ? "border-line bg-surface/80"
          : "border-dashed border-line-strong bg-surface-muted/50",
      ].join(" ")}
    >
      <div
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
          checked
            ? "bg-success-soft text-success-ink"
            : "bg-surface-muted text-ink-subtle",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-bold text-ink">
          {title}
          <span
            className={[
              "rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide",
              checked
                ? "bg-success-soft text-success-ink"
                : "bg-surface-muted text-ink-subtle",
            ].join(" ")}
          >
            {checked ? "Public" : "Hidden"}
          </span>
        </p>

        <p className="mt-0.5 truncate text-xs text-ink-subtle">
          {description}
        </p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={`${title} visibility`}
      />
    </div>
  );
}


/* =========================================================
   TOLI SECTION
========================================================= */

function CharacterSettingsSection() {
  const catalogQuery = useCharactersQuery();
  const selectionQuery = useMyCharacterQuery();
  const [save, saveState] = useSaveCharacterMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const selectedId = selectionQuery.data?.character.definition.id ?? null;
  const loadout = selectionQuery.data?.character.loadout as
    | Record<string, unknown>
    | undefined;

  const select = async (characterId: string) => {
    if (characterId === selectedId) {
      return;
    }
    setPendingId(characterId);
    try {
      await save({ characterId }).unwrap();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Home identity"
        title="Character"
        description="Your personal 3D Home character — not your profile picture. Two free characters at launch."
        icon={Sparkles}
      />
      <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
        <CardContent className="p-5">
          {catalogQuery.isLoading || selectionQuery.isLoading ? (
            <p className="text-sm text-ink-subtle">Loading characters…</p>
          ) : catalogQuery.isError || !catalogQuery.data ? (
            <p className="text-sm text-ink-subtle" role="alert">
              Couldn&apos;t load characters.{" "}
              <button
                type="button"
                className="font-semibold text-brand hover:underline"
                onClick={() => {
                  catalogQuery.refetch();
                  selectionQuery.refetch();
                }}
              >
                Try again
              </button>
            </p>
          ) : (
            <CharacterPicker
              characters={catalogQuery.data}
              selectedId={selectedId}
              loadout={loadout}
              pendingId={pendingId ?? (saveState.isLoading ? selectedId : null)}
              onSelect={(id) => void select(id)}
            />
          )}
          {saveState.isError && (
            <p className="mt-3 text-xs text-red-500" role="alert">
              Couldn&apos;t save your character. Please try again.
            </p>
          )}
          {selectionQuery.data && (
            <p className="mt-3 text-xs text-ink-subtle">
              Event Coins: {selectionQuery.data.eventCoins} · Owned:{" "}
              {selectionQuery.data.ownedCharacterIds.join(", ") || "—"}
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
        <CardHeader className="px-5 pb-2 pt-5">
          <h3 className="text-[15px] font-extrabold text-ink">Wardrobe</h3>
          <p className="text-xs text-ink-subtle">
            Supported slots render on Home. Event cosmetics stay owned after
            events end.
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-6 pt-2">
          <WardrobePicker />
        </CardContent>
      </Card>
    </div>
  );
}

function ToliSettingsSection() {
  const profileQuery = useMyProfile(true);
  const profile = profileQuery.data;
  const tolisQuery = useTolisQuery();
  const [selectToli, selectState] = useSelectToliMutation();
  const [updatePicture, pictureState] = useUpdateProfilePictureMutation();

  const [toliId, setToliId] = useState<string | null | undefined>(undefined);
  const [avatarKey, setAvatarKey] = useState<string | null | undefined>(
    undefined,
  );
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  const effectiveToliId = toliId ?? profile?.toli?.id ?? null;
  const targetedToli = tolisQuery.data?.find(
    (toli) => toli.id === effectiveToliId,
  );
  const changed =
    (toliId !== undefined && toliId !== (profile?.toli?.id ?? null)) ||
    (avatarKey !== undefined &&
      avatarKey !== (profile?.profilePicture?.toliAvatarKey ?? null));
  const saving = selectState.isLoading || pictureState.isLoading;

  async function handleSave() {
    if (!changed || saving) {
      return;
    }

    setFailed(false);

    try {
      if (toliId !== undefined && toliId !== (profile?.toli?.id ?? null)) {
        await selectToli({ toliId }).unwrap();
      }

      const finalToliId = toliId ?? profile?.toli?.id ?? null;

      if (finalToliId && avatarKey && avatarKey !== PROVIDER_AVATAR_VALUE) {
        await updatePicture({ type: "toli", avatarKey }).unwrap();
      } else if (
        avatarKey === PROVIDER_AVATAR_VALUE &&
        profile?.profilePicture?.type === "toli"
      ) {
        await updatePicture({ type: "provider" }).unwrap();
      }

      setToliId(undefined);
      setAvatarKey(undefined);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  if (profileQuery.isLoading || !profile) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Clan identity"
        title="My Toli"
        description="One Toli per member. Switching resets a Toli avatar back to your login photo until you pick one for the new Toli."
        icon={Gamepad2}
      />
      {profile.toli ? (
        <div className="flex items-center gap-2">
          <ToliBadge name={profile.toli.name} />
          <span className="text-xs text-ink-subtle">Currently enlisted</span>
        </div>
      ) : null}

      <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
        <CardContent className="p-5">
          {tolisQuery.isLoading ? (
            <p className="text-xs text-ink-muted">Loading Tolies...</p>
          ) : (
            <ToliPicker
              tolis={tolisQuery.data ?? []}
              value={effectiveToliId}
              onChange={(id) => {
                setToliId(id);
                setAvatarKey(null);
                setSaved(false);
              }}
            />
          )}
        </CardContent>
      </Card>

      {targetedToli ? (
        <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
          <CardContent className="p-5">
            <ToliAvatarPicker
              avatars={targetedToli.avatars}
              toliName={targetedToli.name}
              // Display-only fallback: when the persisted picture is the
              // login photo, `toliAvatarKey` is null, so reflect the provider
              // choice explicitly (does not affect the save diff above).
              value={
                avatarKey ??
                (profile.profilePicture?.type === "provider"
                  ? PROVIDER_AVATAR_VALUE
                  : (profile.profilePicture?.toliAvatarKey ?? null))
              }
              providerAvatarUrl={profile.avatarUrl}
              onChange={(key) => {
                setAvatarKey(key);
                setSaved(false);
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {failed ? (
        <p className="rounded-2xl border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
          Could not save your Toli. Please try again.
        </p>
      ) : null}

      <Button
        type="button"
        onClick={handleSave}
        disabled={!changed || saving}
        className="w-full rounded-2xl py-6 text-[15px] font-bold shadow-lg shadow-brand/25 sm:w-auto sm:px-10"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Toli"}
      </Button>
    </div>
  );
}


/* =========================================================
   BLOCKED USERS SECTION
========================================================= */

function BlockedUsersSection() {
  const blocksQuery = useBlocksQuery();
  const [unblockUser] = useUnblockUserMutation();
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const blocks = blocksQuery.data ?? [];

  async function handleUnblock(block: {
    id: string;
    blockedUser: { publicUserId?: string };
  }) {
    const target = block.blockedUser.publicUserId;
    if (!target) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setUnblockingId(block.id);
    try {
      await unblockUser(target).unwrap();
    } catch {
      setFailed(true);
    } finally {
      setUnblockingId(null);
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
      <CardHeader className="border-b border-line/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-danger-soft text-danger-ink">
              <Shield className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-ink">
                Blocked users
              </h3>
              <p className="text-xs text-ink-subtle">
                Blocked users cannot message you or send requests.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-extrabold text-ink-muted">
            {blocks.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-3 py-3">
        {blocksQuery.isLoading ? (
          <p className="px-2 py-2 text-xs text-ink-muted">Loading...</p>
        ) : blocks.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-sm font-bold text-ink">Nobody blocked</p>
            <p className="mt-0.5 text-xs text-ink-subtle">
              Your block list is empty. Enjoy the peace.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface-muted/70"
              >
                {block.blockedUser.profile ? (
                  <UserAvatar
                    user={{
                      displayName:
                        block.blockedUser.profile.displayName,
                      avatarUrl:
                        block.blockedUser.profile.avatarUrl ?? null,
                      profilePicture:
                        block.blockedUser.profile.profilePicture,
                    }}
                    size={40}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {block.blockedUser.profile?.displayName ?? "Unknown user"}
                  </p>
                  <p className="truncate text-[11px] text-ink-subtle">
                    <HirotoliId
                      publicUserId={
                        block.blockedUser.publicUserId ??
                        block.blockedUser.profile?.publicUserId
                      }
                      username={block.blockedUser.profile?.username}
                    />
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={unblockingId === block.id}
                  onClick={() => void handleUnblock(block)}
                >
                  {unblockingId === block.id ? "Unblocking..." : "Unblock"}
                </Button>
              </div>
            ))}
          </div>
        )}
        {failed ? (
          <p className="mx-2 mt-2 rounded-xl border border-danger bg-danger-soft p-3 text-xs text-danger-ink">
            Could not unblock. Please try again.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}


/* =========================================================
   PAGE
========================================================= */

export function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authQuery = useAuthSession();

  const isLoggedIn = Boolean(authQuery.data);
  const user = authQuery.data?.user;

  const logout = useLogout();

  const [activeSection, setActiveSection] =
    useState<SectionId>("appearance");

  const settingsQuery = useSettingsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [updateSettings, updateState] =
    useUpdateSettingsMutation();

  const settings = settingsQuery.data;


  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [localTheme, setLocalTheme] =
    useState<ThemePreference>("system");

  const [localAccent, setLocalAccent] =
    useState("#ff2e63");

  const [localVisibility, setLocalVisibility] =
    useState<ProfileVisibility>({ ...DEFAULT_VISIBILITY });

  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);


  /* =======================================================
     SYNC API DATA → LOCAL STATE
  ======================================================= */

  useEffect(() => {
    if (!settings) {
      return;
    }

    setLocalTheme(settings.theme);
    setLocalAccent(settings.accentColor);
    setLocalVisibility(settings.profileVisibility ?? { ...DEFAULT_VISIBILITY });
  }, [settings]);


  /* =======================================================
     CHANGE DETECTION
  ======================================================= */

  const hasChanges =
    localTheme !== settings?.theme ||
    localAccent !== settings?.accentColor ||
    JSON.stringify(localVisibility) !==
      JSON.stringify(settings?.profileVisibility);

  const visibleCount = VISIBILITY_KEYS.filter(
    (key) => localVisibility[key] ?? true,
  ).length;


  /* =======================================================
     THEME / ACCENT / VISIBILITY
  ======================================================= */

  const handleThemeChange = (theme: ThemePreference) => {
    setLocalTheme(theme);
    dispatch(setThemeMode(theme));
    setSaved(false);
  };

  const handleAccentChange = (accent: string) => {
    setLocalAccent(accent);
    const accentValue =
      accentOptions.find((item) => item.swatch === accent)?.value;
    if (accentValue) {
      dispatch(setThemeAccent(accentValue));
    }
    setSaved(false);
  };

  const handleVisibilityChange = (
    key: keyof ProfileVisibility,
    value: boolean,
  ) => {
    setLocalVisibility((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };

  const handleBulkVisibility = (value: boolean) => {
    setLocalVisibility((previous) => {
      const next = { ...previous };
      for (const key of VISIBILITY_KEYS) {
        next[key] = value;
      }
      return next;
    });
    setSaved(false);
  };


  /* =======================================================
     SAVE / RESET / LOGOUT / COPY
  ======================================================= */

  const handleSave = async () => {
    if (!hasChanges) {
      return;
    }
    await updateSettings({
      theme: localTheme,
      accentColor: localAccent,
      profileVisibility: localVisibility,
    }).unwrap();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleReset = () => {
    setLocalTheme("system");
    setLocalAccent("#ff2e63");
    setLocalVisibility({ ...DEFAULT_VISIBILITY });
    dispatch(setThemeMode("system"));
    const accentValue =
      accentOptions.find((item) => item.swatch === "#ff2e63")?.value;
    if (accentValue) {
      dispatch(setThemeAccent(accentValue));
    }
    setSaved(false);
  };

  const handleLogoutPress = () => {
    if (!confirmingLogout) {
      setConfirmingLogout(true);
      setTimeout(() => setConfirmingLogout(false), 4000);
      return;
    }
    setConfirmingLogout(false);
    void handleLogout();
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate("/");
  };

  const handleCopyId = async () => {
    if (!user?.publicUserId) {
      return;
    }
    try {
      await navigator.clipboard.writeText(user.publicUserId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
  };


  /* =======================================================
     AUTH LOCK / LOADING
  ======================================================= */

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Settings are locked"
          message="Login to access your settings."
        />
      </AppShell>
    );
  }

  if (settingsQuery.isLoading || !settings) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="space-y-6">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <Skeleton className="h-[500px] rounded-2xl" />
              <Skeleton className="h-[500px] rounded-2xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppShell>
      <div className="relative min-h-dvh bg-background lg:h-dvh lg:overflow-y-auto">
        {/* Ambient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-drift absolute -top-24 right-[10%] h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
          <div
            className="orb-drift absolute top-64 left-[2%] h-80 w-80 rounded-full bg-[#5B3FF5]/10 blur-3xl"
            style={{ animationDelay: "-4s" }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6">

          {/* =============================================
              PLAYER HEADER CARD
          ============================================= */}

          <div className="feed-item relative overflow-hidden rounded-2xl shadow-xl shadow-brand/10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#172b67] via-[#253c91] to-[#4b267d]" />
            <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl" />
            <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-blue-400/30 blur-3xl" />

            <div className="relative flex flex-wrap items-center gap-4 p-5 sm:p-7">
              {user ? (
                <span className="rounded-full bg-white/15 p-1 backdrop-blur">
                  <UserAvatar user={user} size={68} fallback="initial" />
                </span>
              ) : (
                <span className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white/15 text-3xl font-black text-white backdrop-blur">
                  ?
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {user?.displayName ?? "Settings"}
                  </h1>
                  <Badge className="gap-1 rounded-full border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    LVL · Member
                  </Badge>
                </div>
                {user?.publicUserId ? (
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy HiRotoli ID"
                    className="mt-1.5 flex items-center gap-1.5 rounded-full bg-black/25 py-1 pl-3 pr-2 font-mono text-xs text-white/85 backdrop-blur transition hover:bg-black/40 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    {user.publicUserId}
                    {copiedId ? (
                      <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                    ) : (
                      <Copy className="h-3.5 w-3.5 opacity-70" aria-hidden />
                    )}
                  </button>
                ) : null}
                <p className="mt-1.5 text-xs text-white/60 sm:text-sm">
                  Tune the game to your style — look, clan, privacy, account.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 hover:text-white"
                onClick={() => navigate("/profile")}
              >
                <CircleUserRound className="mr-2 h-4 w-4" />
                View profile
              </Button>
            </div>
          </div>

          {/* =============================================
              MOBILE SECTION CHIPS
          ============================================= */}

          <div
            role="tablist"
            aria-label="Settings sections"
            className="sticky top-0 z-10 -mx-4 mt-4 flex gap-2 overflow-x-auto bg-background/80 px-4 py-2 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
          >
            {settingSections.map((section) => {
              const Icon = section.icon;
              const selected = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  role="tab"
                  aria-selected={selected}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-95",
                    selected
                      ? "border-brand bg-brand text-on-brand shadow-md shadow-brand/25"
                      : "border-line bg-surface/80 text-ink-muted backdrop-blur",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* =============================================
              MAIN LAYOUT
          ============================================= */}

          <div className="mt-4 grid min-h-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">

            {/* Desktop rail */}
            <aside className="hidden min-h-0 lg:block">
              <div className="feed-item flex flex-col gap-1 rounded-2xl border border-line bg-surface/80 p-2.5 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2.5 px-3 pb-2 pt-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-on-brand shadow-md shadow-brand/25">
                    <Settings2 className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-ink">
                      Control deck
                    </p>
                    <p className="text-[11px] text-ink-subtle">
                      {visibleCount} of {VISIBILITY_KEYS.length} public
                    </p>
                  </div>
                </div>

                <Separator className="mb-1.5" />

                <nav className="space-y-1" aria-label="Settings sections">
                  {settingSections.map((section) => {
                    const Icon = section.icon;
                    const selected = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        aria-current={selected ? "page" : undefined}
                        className={[
                          "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand",
                          selected
                            ? "bg-brand text-white shadow-lg shadow-brand/25"
                            : "text-ink-subtle hover:bg-surface-muted/70 hover:text-ink",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors",
                            selected
                              ? "bg-white/20 text-white"
                              : "bg-surface-muted text-ink-subtle group-hover:text-ink",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-extrabold">
                            {section.label}
                          </span>
                          <span
                            className={[
                              "block truncate text-[11px]",
                              selected ? "text-white/75" : "text-ink-subtle",
                            ].join(" ")}
                          >
                            {section.description}
                          </span>
                        </span>
                        {selected && (
                          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-surface-muted/70 p-3">
                  {user ? (
                    <UserAvatar user={user} size={36} fallback="initial" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-ink">
                      {user?.displayName ?? "User"}
                    </p>
                    <p className="truncate text-[11px] text-ink-subtle">
                      <HirotoliId
                        publicUserId={user?.publicUserId}
                        username={user?.username}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="min-w-0">
              <div key={activeSection} className="feed-item">

                {activeSection === "appearance" && (
                  <div className="space-y-5">
                    <SectionHeader
                      eyebrow="Look & feel"
                      title="Display"
                      description="Preview a theme, then stamp the interface with your accent color."
                      icon={Palette}
                    />

                    <Card className="overflow-hidden rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
                      <CardHeader className="border-b border-line/70 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                            <SlidersHorizontal className="h-4 w-4" aria-hidden />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-extrabold text-ink">
                              Interface theme
                            </h3>
                            <p className="text-xs text-ink-subtle">
                              Applies instantly. Saving keeps it on every device.
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <ThemeOption
                            icon={Monitor}
                            title="Light"
                            description="Clean & bright"
                            mock="light"
                            active={localTheme === "light"}
                            onClick={() => handleThemeChange("light")}
                          />
                          <ThemeOption
                            icon={Moon}
                            title="Dark"
                            description="Easy on the eyes"
                            mock="dark"
                            active={localTheme === "dark"}
                            onClick={() => handleThemeChange("dark")}
                          />
                          <ThemeOption
                            icon={Smartphone}
                            title="System"
                            description="Follow your device"
                            mock="split"
                            active={localTheme === "system"}
                            onClick={() => handleThemeChange("system")}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
                      <CardHeader className="px-5 pb-2 pt-5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-surface-muted text-ink-subtle">
                            <Palette className="h-4 w-4" aria-hidden />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-extrabold text-ink">
                              Accent color
                            </h3>
                            <p className="text-xs text-ink-subtle">
                              Buttons, highlights and your glow.
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-6 pt-4">
                        <div className="flex flex-wrap gap-5">
                          {accentOptions.map((accent) => (
                            <AccentOption
                              key={accent.value}
                              color={accent.swatch}
                              label={accent.label}
                              selected={localAccent === accent.swatch}
                              onClick={() => handleAccentChange(accent.swatch)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === "character" && <CharacterSettingsSection />}

                {activeSection === "toli" && <ToliSettingsSection />}

                {activeSection === "privacy" && (
                  <div className="space-y-5">
                    <SectionHeader
                      eyebrow="Visibility shield"
                      title="Privacy"
                      description="Decide exactly which profile details other people can see."
                      icon={ShieldCheck}
                    />

                    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/80 p-5 shadow-sm backdrop-blur">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
                      />
                      <div className="relative flex flex-wrap items-center gap-4">
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/25">
                          {visibleCount >= 8 ? (
                            <Eye className="h-6 w-6" aria-hidden />
                          ) : (
                            <EyeOff className="h-6 w-6" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-extrabold text-ink">
                            {visibleCount} of {VISIBILITY_KEYS.length} details public
                          </p>
                          <div
                            role="progressbar"
                            aria-valuenow={visibleCount}
                            aria-valuemin={0}
                            aria-valuemax={VISIBILITY_KEYS.length}
                            aria-label="Public details"
                            className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-muted"
                          >
                            <div
                              className="h-full rounded-full bg-brand transition-all duration-500"
                              style={{
                                width: `${(visibleCount / VISIBILITY_KEYS.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleBulkVisibility(true)}
                          >
                            All public
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleBulkVisibility(false)}
                          >
                            All private
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {VISIBILITY_META.map((item) => (
                        <VisibilityItem
                          key={item.key}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                          checked={localVisibility[item.key] ?? true}
                          onChange={(value) =>
                            handleVisibilityChange(item.key, value)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "account" && (
                  <div className="space-y-5">
                    <SectionHeader
                      eyebrow="Control center"
                      title="Account"
                      description="Identity, safety and your session on this device."
                      icon={CircleUserRound}
                    />

                    <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
                      <CardHeader className="px-5 pb-3 pt-5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                            <CircleUserRound className="h-4 w-4" aria-hidden />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-extrabold text-ink">
                              Profile
                            </h3>
                            <p className="text-xs text-ink-subtle">
                              Manage your public identity.
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pb-3">
                        <SettingsRow
                          icon={User}
                          title="Edit profile"
                          description="Name, avatar, bio and personal information."
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => navigate("/profile")}
                          >
                            Edit
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </SettingsRow>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
                      <CardHeader className="px-5 pb-3 pt-5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-surface-muted text-ink-subtle">
                            <Lock className="h-4 w-4" aria-hidden />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-extrabold text-ink">
                              Security
                            </h3>
                            <p className="text-xs text-ink-subtle">
                              How your account stays protected.
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1 px-3 pb-3">
                        <SettingsRow
                          icon={Mail}
                          title="Toli"
                          description="Your clan membership."
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => setActiveSection("toli")}
                          >
                            Manage
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </SettingsRow>
                        <SettingsRow
                          icon={Shield}
                          title="Login protection"
                          description="Secured with provider authentication."
                        >
                          <Badge
                            variant="secondary"
                            className="gap-1 rounded-full text-[11px]"
                          >
                            <Check className="h-3 w-3" />
                            Protected
                          </Badge>
                        </SettingsRow>
                      </CardContent>
                    </Card>

                    <BlockedUsersSection />

                    <Card className="rounded-2xl border-line bg-surface/80 shadow-sm backdrop-blur">
                      <CardContent className="p-3">
                        <SettingsRow
                          icon={Bell}
                          title="Notifications"
                          description="Notification preferences will live here."
                        >
                          <Badge
                            variant="outline"
                            className="rounded-full text-[11px]"
                          >
                            Coming soon
                          </Badge>
                        </SettingsRow>
                        <SettingsRow
                          icon={Globe}
                          title="Connected services"
                          description="Manage external account connections."
                        >
                          <Badge
                            variant="outline"
                            className="rounded-full text-[11px]"
                          >
                            Coming soon
                          </Badge>
                        </SettingsRow>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-2xl border-danger/40 bg-gradient-to-br from-danger-soft/60 to-transparent shadow-sm backdrop-blur">
                      <CardContent className="p-3">
                        <SettingsRow
                          icon={LogOut}
                          title="Sign out"
                          description={
                            confirmingLogout
                              ? "Tap confirm to end this session."
                              : "Sign out from this device."
                          }
                          danger
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full px-5"
                            disabled={logout.isPending}
                            onClick={handleLogoutPress}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            {logout.isPending
                              ? "Signing out..."
                              : confirmingLogout
                                ? "Confirm"
                                : "Sign out"}
                          </Button>
                        </SettingsRow>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* =============================================
              FLOATING SAVE BAR
          ============================================= */}

          <div className="sticky bottom-20 z-20 mt-6 lg:bottom-6">
            <div
              className={[
                "mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border py-2.5 pl-4 pr-2.5 shadow-xl backdrop-blur-md transition-all",
                hasChanges
                  ? "border-brand/40 bg-surface/95 shadow-brand/20"
                  : "border-line bg-surface/90",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
                    saved
                      ? "bg-success text-white"
                      : hasChanges
                        ? "bg-brand text-white shadow-md shadow-brand/30"
                        : "bg-surface-muted text-ink-subtle",
                  ].join(" ")}
                >
                  {saved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Settings2 className="h-4 w-4" />
                  )}
                </div>
                <p className="truncate text-xs font-bold text-ink">
                  {saved
                    ? "Changes saved"
                    : hasChanges
                      ? "Unsaved changes"
                      : "All synced"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="rounded-full px-5 text-xs shadow-md shadow-brand/25"
                  disabled={!hasChanges || updateState.isLoading}
                  onClick={handleSave}
                >
                  {updateState.isLoading
                    ? "Saving..."
                    : saved
                      ? "Saved"
                      : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
