"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Info,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Palette,
  RefreshCcw,
  Shield,
  Smartphone,
  User,
  Users,
} from "lucide-react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession, useLogout } from "@/features/auth/api";
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
  type ThemePreference,
  type ProfileVisibility,
} from "@/rtk/settings/settings-api";
import { useDispatch } from "react-redux";
import { setThemeMode, setThemeAccent } from "@/store/ui-slice";
import type { AppDispatch } from "@/store/store";
import { accentOptions } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type TabId = "appearance" | "visibility" | "account";

function SettingItem({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: typeof Eye;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface-muted p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-subtle">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && (
          <p className="text-xs text-ink-subtle">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-line-strong"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SelectOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
        active
          ? "border-brand bg-brand-soft text-brand-ink"
          : "border-line bg-surface text-ink-muted hover:border-line-strong"
      }`}
    >
      {children}
      {active && <Check className="h-4 w-4 text-brand" aria-hidden />}
    </button>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const user = authQuery.data?.user;
  const logout = useLogout();
  const [activeTab, setActiveTab] = useState<TabId>("appearance");

  const settingsQuery = useSettingsQuery(undefined, {
    skip: !isLoggedIn,
  });
  const [updateSettings, updateState] = useUpdateSettingsMutation();

  const settings = settingsQuery.data;
  const [localTheme, setLocalTheme] = useState<ThemePreference>(
    settings?.theme ?? "system",
  );
  const [localAccent, setLocalAccent] = useState<string>(
    settings?.accentColor ?? "#ff2e63",
  );
  const [localVisibility, setLocalVisibility] = useState<ProfileVisibility>(
    settings?.profileVisibility ?? {
      avatar: true,
      bio: true,
      dob: true,
      age: true,
      gender: true,
      region: true,
      city: true,
      primaryLanguage: true,
      languages: true,
    },
  );
  const [saved, setSaved] = useState(false);

  const hasChanges =
    localTheme !== settings?.theme ||
    localAccent !== settings?.accentColor ||
    JSON.stringify(localVisibility) !== JSON.stringify(settings?.profileVisibility);

  const handleThemeChange = (theme: ThemePreference) => {
    setLocalTheme(theme);
    dispatch(setThemeMode(theme));
    setSaved(false);
  };

  const handleAccentChange = (accent: string) => {
    setLocalAccent(accent);
    const accentValue = accentOptions.find((a) => a.swatch === accent)?.value;
    if (accentValue) {
      dispatch(setThemeAccent(accentValue));
    }
    setSaved(false);
  };

  const handleVisibilityChange = (key: keyof ProfileVisibility, value: boolean) => {
    setLocalVisibility((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    await updateSettings({
      theme: localTheme,
      accentColor: localAccent,
      profileVisibility: localVisibility,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultTheme: ThemePreference = "system";
    const defaultAccent = "#ff2e63";
    const defaultVisibility: ProfileVisibility = {
      avatar: true,
      bio: true,
      dob: true,
      age: true,
      gender: true,
      region: true,
      city: true,
      primaryLanguage: true,
      languages: true,
    };
    setLocalTheme(defaultTheme);
    setLocalAccent(defaultAccent);
    setLocalVisibility(defaultVisibility);
    dispatch(setThemeMode(defaultTheme));
    const accentValue = accentOptions.find((a) => a.swatch === defaultAccent)?.value;
    if (accentValue) {
      dispatch(setThemeAccent(accentValue));
    }
    setSaved(false);
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
  };

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
        <section className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-6 h-32 w-full" />
            <Skeleton className="mt-4 h-20 w-full" />
          </div>
        </section>
      </AppShell>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof Palette }[] = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "visibility", label: "Visibility", icon: Eye },
    { id: "account", label: "Account", icon: User },
  ];

  return (
    <AppShell>
      <section className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6">
        {/* Profile header - BGMI style */}
        <div className="mb-6 shrink-0 rounded-2xl border border-line bg-gradient-to-br from-brand/10 via-brand/5 to-purple-500/10 p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-2xl font-bold text-white">
              {user?.displayName?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-ink">
                {user?.displayName ?? "User"}
              </h2>
              <p className="text-sm text-ink-muted">@{user?.username}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-subtle" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex shrink-0 gap-1 rounded-xl bg-surface-muted p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-subtle hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings content - scrollable area */}
        <div className="flex-1 space-y-3 overflow-y-auto pb-4">
          {activeTab === "appearance" && (
            <>
              <SettingItem
                icon={Moon}
                label="Theme"
                description="Choose light, dark, or system theme"
              >
                <div className="flex gap-2">
                  <SelectOption
                    active={localTheme === "light"}
                    onClick={() => handleThemeChange("light")}
                  >
                    <Monitor className="h-4 w-4" />
                    Light
                  </SelectOption>
                  <SelectOption
                    active={localTheme === "dark"}
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </SelectOption>
                  <SelectOption
                    active={localTheme === "system"}
                    onClick={() => handleThemeChange("system")}
                  >
                    <Smartphone className="h-4 w-4" />
                    Auto
                  </SelectOption>
                </div>
              </SettingItem>

              <SettingItem
                icon={Palette}
                label="Accent Color"
                description="Your favorite accent color"
              >
                <div className="flex gap-2">
                  {accentOptions.map((accent) => {
                    const selected = localAccent === accent.swatch;
                    return (
                      <button
                        key={accent.value}
                        type="button"
                        onClick={() => handleAccentChange(accent.swatch)}
                        className={`grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-110 ${
                          selected ? "ring-2 ring-brand ring-offset-2 ring-offset-background" : ""
                        }`}
                        style={{ backgroundColor: accent.swatch }}
                        aria-label={accent.label}
                      >
                        {selected && <Check className="h-4 w-4 text-white" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              </SettingItem>
            </>
          )}

          {activeTab === "visibility" && (
            <>
              <SettingItem
                icon={User}
                label="Avatar"
                description="Show your avatar on your public profile"
              >
                <Toggle
                  checked={localVisibility.avatar ?? true}
                  onChange={(v) => handleVisibilityChange("avatar", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Eye}
                label="Bio"
                description="Show your bio on your public profile"
              >
                <Toggle
                  checked={localVisibility.bio ?? true}
                  onChange={(v) => handleVisibilityChange("bio", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Calendar}
                label="Date of Birth"
                description="Show your date of birth on your public profile"
              >
                <Toggle
                  checked={localVisibility.dob ?? true}
                  onChange={(v) => handleVisibilityChange("dob", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Shield}
                label="Age Group"
                description="Show your age group on your public profile"
              >
                <Toggle
                  checked={localVisibility.age ?? true}
                  onChange={(v) => handleVisibilityChange("age", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Users}
                label="Gender"
                description="Show your gender on your public profile"
              >
                <Toggle
                  checked={localVisibility.gender ?? true}
                  onChange={(v) => handleVisibilityChange("gender", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Globe}
                label="Region"
                description="Show your region on your public profile"
              >
                <Toggle
                  checked={localVisibility.region ?? true}
                  onChange={(v) => handleVisibilityChange("region", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Info}
                label="City"
                description="Show your city on your public profile"
              >
                <Toggle
                  checked={localVisibility.city ?? true}
                  onChange={(v) => handleVisibilityChange("city", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Globe}
                label="Primary Language"
                description="Show your primary language on your public profile"
              >
                <Toggle
                  checked={localVisibility.primaryLanguage ?? true}
                  onChange={(v) => handleVisibilityChange("primaryLanguage", v)}
                />
              </SettingItem>
              <SettingItem
                icon={Globe}
                label="Languages"
                description="Show your languages on your public profile"
              >
                <Toggle
                  checked={localVisibility.languages ?? true}
                  onChange={(v) => handleVisibilityChange("languages", v)}
                />
              </SettingItem>
            </>
          )}

          {activeTab === "account" && (
            <>
              <SettingItem
                icon={User}
                label="Profile"
                description="Edit your profile information"
              >
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-1 text-sm font-medium text-brand"
                >
                  Edit
                  <ChevronRight className="h-4 w-4" />
                </button>
              </SettingItem>
              <SettingItem
                icon={Mail}
                label="Email"
                description="Manage email notifications"
              >
                <ChevronRight className="h-5 w-5 text-ink-subtle" />
              </SettingItem>
              <SettingItem
                icon={Shield}
                label="Privacy"
                description="Manage your privacy settings"
              >
                <ChevronRight className="h-5 w-5 text-ink-subtle" />
              </SettingItem>
              <SettingItem
                icon={LogOut}
                label="Logout"
                description="Sign out of your account"
              >
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="rounded-lg bg-danger-soft px-4 py-2 text-sm font-medium text-danger-ink hover:bg-danger-soft/80 disabled:opacity-50"
                >
                  {logout.isPending ? "Logging out..." : "Logout"}
                </button>
              </SettingItem>
            </>
          )}
        </div>

        {/* Bottom actions - always visible */}
        <div className="shrink-0 border-t border-line bg-background pt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-sm font-medium text-ink-subtle hover:text-ink"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset to default
            </button>

            {hasChanges && (
              <button
                type="button"
                onClick={handleSave}
                disabled={updateState.isLoading}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-hover disabled:opacity-50"
              >
                {updateState.isLoading ? "Saving..." : saved ? "Saved!" : "Save changes"}
              </button>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
