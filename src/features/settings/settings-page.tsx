// "use client";

// import { useState } from "react";
// import {
//   Calendar,
//   Check,
//   ChevronRight,
//   Eye,
//   EyeOff,
//   Globe,
//   Info,
//   LogOut,
//   Mail,
//   Monitor,
//   Moon,
//   Palette,
//   RefreshCcw,
//   Shield,
//   Smartphone,
//   User,
//   Users,
// } from "lucide-react";
// import { LockedPanel } from "@/components/common/locked-panel";
// import { AppShell } from "@/components/layout/app-shell";
// import { useAuthSession, useLogout } from "@/features/auth/api";
// import {
//   useSettingsQuery,
//   useUpdateSettingsMutation,
//   type ThemePreference,
//   type ProfileVisibility,
// } from "@/rtk/settings/settings-api";
// import { useDispatch } from "react-redux";
// import { setThemeMode, setThemeAccent } from "@/store/ui-slice";
// import type { AppDispatch } from "@/store/store";
// import { accentOptions } from "@/lib/theme";
// import { useRouter } from "next/navigation";
// import { Skeleton } from "@/components/ui/skeleton";

// type TabId = "appearance" | "visibility" | "account";

// function SettingItem({
//   icon: Icon,
//   label,
//   description,
//   children,
// }: {
//   icon: typeof Eye;
//   label: string;
//   description?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex items-center gap-4 rounded-xl bg-surface-muted p-4">
//       <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-subtle">
//         <Icon className="h-5 w-5" aria-hidden />
//       </span>
//       <div className="min-w-0 flex-1">
//         <p className="text-sm font-medium text-ink">{label}</p>
//         {description && (
//           <p className="text-xs text-ink-subtle">{description}</p>
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }

// function Toggle({
//   checked,
//   onChange,
// }: {
//   checked: boolean;
//   onChange: (v: boolean) => void;
// }) {
//   return (
//     <button
//       type="button"
//       role="switch"
//       aria-checked={checked}
//       onClick={() => onChange(!checked)}
//       className={`relative h-7 w-12 rounded-full transition-colors ${
//         checked ? "bg-brand" : "bg-line-strong"
//       }`}
//     >
//       <span
//         className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
//           checked ? "left-6" : "left-1"
//         }`}
//       />
//     </button>
//   );
// }

// function SelectOption({
//   active,
//   onClick,
//   children,
// }: {
//   active: boolean;
//   onClick: () => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
//         active
//           ? "border-brand bg-brand-soft text-brand-ink"
//           : "border-line bg-surface text-ink-muted hover:border-line-strong"
//       }`}
//     >
//       {children}
//       {active && <Check className="h-4 w-4 text-brand" aria-hidden />}
//     </button>
//   );
// }

// export function SettingsPage() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const authQuery = useAuthSession();
//   const isLoggedIn = Boolean(authQuery.data);
//   const user = authQuery.data?.user;
//   const logout = useLogout();
//   const [activeTab, setActiveTab] = useState<TabId>("appearance");

//   const settingsQuery = useSettingsQuery(undefined, {
//     skip: !isLoggedIn,
//   });
//   const [updateSettings, updateState] = useUpdateSettingsMutation();

//   const settings = settingsQuery.data;
//   const [localTheme, setLocalTheme] = useState<ThemePreference>(
//     settings?.theme ?? "system",
//   );
//   const [localAccent, setLocalAccent] = useState<string>(
//     settings?.accentColor ?? "#ff2e63",
//   );
//   const [localVisibility, setLocalVisibility] = useState<ProfileVisibility>(
//     settings?.profileVisibility ?? {
//       avatar: true,
//       bio: true,
//       dob: true,
//       age: true,
//       gender: true,
//       region: true,
//       city: true,
//       primaryLanguage: true,
//       languages: true,
//     },
//   );
//   const [saved, setSaved] = useState(false);

//   const hasChanges =
//     localTheme !== settings?.theme ||
//     localAccent !== settings?.accentColor ||
//     JSON.stringify(localVisibility) !== JSON.stringify(settings?.profileVisibility);

//   const handleThemeChange = (theme: ThemePreference) => {
//     setLocalTheme(theme);
//     dispatch(setThemeMode(theme));
//     setSaved(false);
//   };

//   const handleAccentChange = (accent: string) => {
//     setLocalAccent(accent);
//     const accentValue = accentOptions.find((a) => a.swatch === accent)?.value;
//     if (accentValue) {
//       dispatch(setThemeAccent(accentValue));
//     }
//     setSaved(false);
//   };

//   const handleVisibilityChange = (key: keyof ProfileVisibility, value: boolean) => {
//     setLocalVisibility((prev) => ({ ...prev, [key]: value }));
//     setSaved(false);
//   };

//   const handleSave = async () => {
//     if (!hasChanges) return;

//     await updateSettings({
//       theme: localTheme,
//       accentColor: localAccent,
//       profileVisibility: localVisibility,
//     });
//     setSaved(true);
//     setTimeout(() => setSaved(false), 2000);
//   };

//   const handleReset = () => {
//     const defaultTheme: ThemePreference = "system";
//     const defaultAccent = "#ff2e63";
//     const defaultVisibility: ProfileVisibility = {
//       avatar: true,
//       bio: true,
//       dob: true,
//       age: true,
//       gender: true,
//       region: true,
//       city: true,
//       primaryLanguage: true,
//       languages: true,
//     };
//     setLocalTheme(defaultTheme);
//     setLocalAccent(defaultAccent);
//     setLocalVisibility(defaultVisibility);
//     dispatch(setThemeMode(defaultTheme));
//     const accentValue = accentOptions.find((a) => a.swatch === defaultAccent)?.value;
//     if (accentValue) {
//       dispatch(setThemeAccent(accentValue));
//     }
//     setSaved(false);
//   };

//   const handleLogout = async () => {
//     await logout.mutateAsync();
//     router.push("/");
//   };

//   if (!isLoggedIn) {
//     return (
//       <AppShell>
//         <LockedPanel
//           title="Settings are locked"
//           message="Login to access your settings."
//         />
//       </AppShell>
//     );
//   }

//   if (settingsQuery.isLoading || !settings) {
//     return (
//       <AppShell>
//         <section className="mx-auto max-w-3xl px-4 py-6">
//           <div className="rounded-2xl border border-line bg-surface p-6">
//             <Skeleton className="h-8 w-40" />
//             <Skeleton className="mt-6 h-32 w-full" />
//             <Skeleton className="mt-4 h-20 w-full" />
//           </div>
//         </section>
//       </AppShell>
//     );
//   }

//   const tabs: { id: TabId; label: string; icon: typeof Palette }[] = [
//     { id: "appearance", label: "Appearance", icon: Palette },
//     { id: "visibility", label: "Visibility", icon: Eye },
//     { id: "account", label: "Account", icon: User },
//   ];

//   return (
//     <AppShell>
//       <section className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6">
//         {/* Profile header - BGMI style */}
//         <div className="mb-6 shrink-0 rounded-2xl border border-line bg-gradient-to-br from-brand/10 via-brand/5 to-purple-500/10 p-6">
//           <div className="flex items-center gap-4">
//             <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-2xl font-bold text-white">
//               {user?.displayName?.charAt(0).toUpperCase() ?? "?"}
//             </div>
//             <div className="min-w-0 flex-1">
//               <h2 className="text-lg font-bold text-ink">
//                 {user?.displayName ?? "User"}
//               </h2>
//               <p className="text-sm text-ink-muted">@{user?.username}</p>
//             </div>
//             <ChevronRight className="h-5 w-5 text-ink-subtle" />
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="mb-6 flex shrink-0 gap-1 rounded-xl bg-surface-muted p-1.5">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;
//             const active = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 type="button"
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
//                   active
//                     ? "bg-surface text-ink shadow-sm"
//                     : "text-ink-subtle hover:text-ink"
//                 }`}
//               >
//                 <Icon className="h-4 w-4" aria-hidden />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* Settings content - scrollable area */}
//         <div className="flex-1 space-y-3 overflow-y-auto pb-4">
//           {activeTab === "appearance" && (
//             <>
//               <SettingItem
//                 icon={Moon}
//                 label="Theme"
//                 description="Choose light, dark, or system theme"
//               >
//                 <div className="flex gap-2">
//                   <SelectOption
//                     active={localTheme === "light"}
//                     onClick={() => handleThemeChange("light")}
//                   >
//                     <Monitor className="h-4 w-4" />
//                     Light
//                   </SelectOption>
//                   <SelectOption
//                     active={localTheme === "dark"}
//                     onClick={() => handleThemeChange("dark")}
//                   >
//                     <Moon className="h-4 w-4" />
//                     Dark
//                   </SelectOption>
//                   <SelectOption
//                     active={localTheme === "system"}
//                     onClick={() => handleThemeChange("system")}
//                   >
//                     <Smartphone className="h-4 w-4" />
//                     Auto
//                   </SelectOption>
//                 </div>
//               </SettingItem>

//               <SettingItem
//                 icon={Palette}
//                 label="Accent Color"
//                 description="Your favorite accent color"
//               >
//                 <div className="flex gap-2">
//                   {accentOptions.map((accent) => {
//                     const selected = localAccent === accent.swatch;
//                     return (
//                       <button
//                         key={accent.value}
//                         type="button"
//                         onClick={() => handleAccentChange(accent.swatch)}
//                         className={`grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-110 ${
//                           selected ? "ring-2 ring-brand ring-offset-2 ring-offset-background" : ""
//                         }`}
//                         style={{ backgroundColor: accent.swatch }}
//                         aria-label={accent.label}
//                       >
//                         {selected && <Check className="h-4 w-4 text-white" aria-hidden />}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </SettingItem>
//             </>
//           )}

//           {activeTab === "visibility" && (
//             <>
//               <SettingItem
//                 icon={User}
//                 label="Avatar"
//                 description="Show your avatar on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.avatar ?? true}
//                   onChange={(v) => handleVisibilityChange("avatar", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Eye}
//                 label="Bio"
//                 description="Show your bio on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.bio ?? true}
//                   onChange={(v) => handleVisibilityChange("bio", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Calendar}
//                 label="Date of Birth"
//                 description="Show your date of birth on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.dob ?? true}
//                   onChange={(v) => handleVisibilityChange("dob", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Shield}
//                 label="Age Group"
//                 description="Show your age group on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.age ?? true}
//                   onChange={(v) => handleVisibilityChange("age", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Users}
//                 label="Gender"
//                 description="Show your gender on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.gender ?? true}
//                   onChange={(v) => handleVisibilityChange("gender", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Globe}
//                 label="Region"
//                 description="Show your region on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.region ?? true}
//                   onChange={(v) => handleVisibilityChange("region", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Info}
//                 label="City"
//                 description="Show your city on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.city ?? true}
//                   onChange={(v) => handleVisibilityChange("city", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Globe}
//                 label="Primary Language"
//                 description="Show your primary language on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.primaryLanguage ?? true}
//                   onChange={(v) => handleVisibilityChange("primaryLanguage", v)}
//                 />
//               </SettingItem>
//               <SettingItem
//                 icon={Globe}
//                 label="Languages"
//                 description="Show your languages on your public profile"
//               >
//                 <Toggle
//                   checked={localVisibility.languages ?? true}
//                   onChange={(v) => handleVisibilityChange("languages", v)}
//                 />
//               </SettingItem>
//             </>
//           )}

//           {activeTab === "account" && (
//             <>
//               <SettingItem
//                 icon={User}
//                 label="Profile"
//                 description="Edit your profile information"
//               >
//                 <button
//                   type="button"
//                   onClick={() => navigate("/profile")}
//                   className="flex items-center gap-1 text-sm font-medium text-brand"
//                 >
//                   Edit
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </SettingItem>
//               <SettingItem
//                 icon={Mail}
//                 label="Email"
//                 description="Manage email notifications"
//               >
//                 <ChevronRight className="h-5 w-5 text-ink-subtle" />
//               </SettingItem>
//               <SettingItem
//                 icon={Shield}
//                 label="Privacy"
//                 description="Manage your privacy settings"
//               >
//                 <ChevronRight className="h-5 w-5 text-ink-subtle" />
//               </SettingItem>
//               <SettingItem
//                 icon={LogOut}
//                 label="Logout"
//                 description="Sign out of your account"
//               >
//                 <button
//                   type="button"
//                   onClick={handleLogout}
//                   disabled={logout.isPending}
//                   className="rounded-lg bg-danger-soft px-4 py-2 text-sm font-medium text-danger-ink hover:bg-danger-soft/80 disabled:opacity-50"
//                 >
//                   {logout.isPending ? "Logging out..." : "Logout"}
//                 </button>
//               </SettingItem>
//             </>
//           )}
//         </div>

//         {/* Bottom actions - always visible */}
//         <div className="shrink-0 border-t border-line bg-background pt-4">
//           <div className="flex items-center justify-between">
//             <button
//               type="button"
//               onClick={handleReset}
//               className="flex items-center gap-2 text-sm font-medium text-ink-subtle hover:text-ink"
//             >
//               <RefreshCcw className="h-4 w-4" />
//               Reset to default
//             </button>

//             {hasChanges && (
//               <button
//                 type="button"
//                 onClick={handleSave}
//                 disabled={updateState.isLoading}
//                 className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-hover disabled:opacity-50"
//               >
//                 {updateState.isLoading ? "Saving..." : saved ? "Saved!" : "Save changes"}
//               </button>
//             )}
//           </div>
//         </div>
//       </section>
//     </AppShell>
//   );
// }

import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Eye,
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
  Lock,
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

import {
  useSettingsQuery,
  useUpdateSettingsMutation,
  type ThemePreference,
  type ProfileVisibility,
} from "@/rtk/settings/settings-api";

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
  | "privacy"
  | "account";


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
    label: "Appearance",
    description: "Theme & personalization",
    icon: Palette,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Control what people see",
    icon: Shield,
  },
  {
    id: "account",
    label: "Account",
    description: "Profile & account",
    icon: User,
  },
];


/* =========================================================
   SMALL SECTION LABEL
========================================================= */

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-subtle">
        {children}
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
    <div className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors hover:bg-surface-muted">
      <div
        className={[
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
          danger
            ? "bg-danger-soft text-danger-ink"
            : "bg-surface-muted text-ink-subtle",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm font-semibold",
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
   THEME OPTION
========================================================= */

function ThemeOption({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: typeof Moon;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex min-h-[112px] flex-1 flex-col rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-brand bg-brand-soft shadow-sm"
          : "border-line bg-surface hover:border-line-strong hover:bg-surface-muted",
      ].join(" ")}
    >
      {active && (
        <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={[
          "mb-3 grid h-9 w-9 place-items-center rounded-lg",
          active
            ? "bg-brand text-white"
            : "bg-surface-muted text-ink-subtle",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-sm font-semibold text-ink">
        {title}
      </p>

      <p className="mt-0.5 text-[11px] text-ink-subtle">
        {description}
      </p>
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
      className="group flex flex-col items-center gap-2"
    >
      <span
        className={[
          "grid h-11 w-11 place-items-center rounded-full transition-all",
          selected
            ? "scale-110 ring-2 ring-brand ring-offset-4 ring-offset-background"
            : "hover:scale-105",
        ].join(" ")}
        style={{ backgroundColor: color }}
      >
        {selected && (
          <Check className="h-5 w-5 text-white drop-shadow" />
        )}
      </span>

      <span
        className={[
          "text-[10px] font-medium",
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
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-ink-subtle">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-ink-subtle">
          {description}
        </p>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
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
    useState<ProfileVisibility>({
      avatar: true,
      bio: true,
      dob: true,
      age: true,
      gender: true,
      region: true,
      city: true,
      primaryLanguage: true,
      languages: true,
    });

  const [saved, setSaved] = useState(false);


  /* =======================================================
     SYNC API DATA → LOCAL STATE
  ======================================================= */

  useEffect(() => {
    if (!settings) {
      return;
    }

    setLocalTheme(settings.theme);
    setLocalAccent(settings.accentColor);

    setLocalVisibility(
      settings.profileVisibility ?? {
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
  }, [settings]);


  /* =======================================================
     CHANGE DETECTION
  ======================================================= */

  const hasChanges =
    localTheme !== settings?.theme ||
    localAccent !== settings?.accentColor ||
    JSON.stringify(localVisibility) !==
      JSON.stringify(settings?.profileVisibility);


  /* =======================================================
     THEME
  ======================================================= */

  const handleThemeChange = (
    theme: ThemePreference,
  ) => {
    setLocalTheme(theme);

    dispatch(setThemeMode(theme));

    setSaved(false);
  };


  /* =======================================================
     ACCENT
  ======================================================= */

  const handleAccentChange = (
    accent: string,
  ) => {
    setLocalAccent(accent);

    const accentValue =
      accentOptions.find(
        (item) => item.swatch === accent,
      )?.value;

    if (accentValue) {
      dispatch(setThemeAccent(accentValue));
    }

    setSaved(false);
  };


  /* =======================================================
     VISIBILITY
  ======================================================= */

  const handleVisibilityChange = (
    key: keyof ProfileVisibility,
    value: boolean,
  ) => {
    setLocalVisibility((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };


  /* =======================================================
     SAVE
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


  /* =======================================================
     RESET
  ======================================================= */

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

    const accentValue =
      accentOptions.find(
        (item) => item.swatch === defaultAccent,
      )?.value;

    if (accentValue) {
      dispatch(setThemeAccent(accentValue));
    }

    setSaved(false);
  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    await logout.mutateAsync();

    navigate("/");
  };


  /* =======================================================
     AUTH LOCK
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


  /* =======================================================
     LOADING
  ======================================================= */

  if (settingsQuery.isLoading || !settings) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />

            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
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
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-5 sm:px-6">


          {/* =================================================
              TOP HERO
          ================================================= */}

          <div className="relative mb-5 shrink-0 overflow-hidden rounded-3xl border border-line bg-surface">
            {/* decorative background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
              <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative flex items-center gap-4 px-5 py-5 sm:px-7">
              {/* avatar */}
              <div className="relative">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-purple-500 text-2xl font-black text-white shadow-lg shadow-brand/20">
                  {user?.displayName
                    ?.charAt(0)
                    .toUpperCase() ?? "?"}
                </div>

                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface bg-emerald-500" />
              </div>

              {/* identity */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-ink sm:text-2xl">
                    Settings
                  </h1>

                  <Badge
                    variant="secondary"
                    className="gap-1 rounded-full px-2 py-0.5 text-[10px]"
                  >
                    <Sparkles className="h-3 w-3" />
                    Personal
                  </Badge>
                </div>

                <p className="mt-1 text-xs text-ink-subtle sm:text-sm">
                  Customize your experience, privacy and account.
                </p>
              </div>

              {/* profile */}
              <Button
                variant="outline"
                size="sm"
                className="hidden shrink-0 rounded-xl sm:flex"
                onClick={() => navigate("/profile")}
              >
                <CircleUserRound className="mr-2 h-4 w-4" />
                View profile
              </Button>
            </div>
          </div>


          {/* =================================================
              MAIN LAYOUT
          ================================================= */}

          <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">


            {/* =================================================
                LEFT SETTINGS NAV
            ================================================= */}

            <aside className="hidden min-h-0 lg:block">
              <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-2">

                <div className="px-3 pb-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Settings2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-ink">
                        Preferences
                      </p>

                      <p className="text-[10px] text-ink-subtle">
                        Manage your account
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="mb-2" />

                <nav className="space-y-1">
                  {settingSections.map((section) => {
                    const Icon = section.icon;
                    const active =
                      activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() =>
                          setActiveSection(section.id)
                        }
                        className={[
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                          active
                            ? "bg-brand text-white shadow-md shadow-brand/20"
                            : "text-ink-subtle hover:bg-surface-muted hover:text-ink",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                            active
                              ? "bg-white/15"
                              : "bg-surface-muted",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold">
                            {section.label}
                          </p>

                          <p
                            className={[
                              "mt-0.5 truncate text-[10px]",
                              active
                                ? "text-white/70"
                                : "text-ink-subtle",
                            ].join(" ")}
                          >
                            {section.description}
                          </p>
                        </div>

                        {active && (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </nav>


                {/* bottom account card */}
                <div className="mt-auto rounded-xl bg-surface-muted p-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-xs font-bold text-white">
                      {user?.displayName
                        ?.charAt(0)
                        .toUpperCase() ?? "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">
                        {user?.displayName ?? "User"}
                      </p>

                      <p className="truncate text-[10px] text-ink-subtle">
                        @{user?.username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>


            {/* =================================================
                RIGHT CONTENT
            ================================================= */}

            <main className="min-h-0 overflow-y-auto pr-1">

              {/* =================================================
                  APPEARANCE
              ================================================= */}

              {activeSection === "appearance" && (
                <div className="space-y-5">

                  <div>
                    <SectionLabel>
                      Appearance
                    </SectionLabel>

                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-ink">
                          Make it yours.
                        </h2>

                        <p className="mt-1 text-xs text-ink-subtle">
                          Personalize the way Social Chat looks for you.
                        </p>
                      </div>

                      <Palette className="hidden h-7 w-7 text-brand sm:block" />
                    </div>
                  </div>


                  {/* Theme */}
                  <Card className="overflow-hidden rounded-2xl border-line shadow-none">
                    <CardHeader className="border-b border-line bg-surface-muted/40 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
                          <SlidersHorizontal className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-ink">
                            Interface theme
                          </h3>

                          <p className="text-[11px] text-ink-subtle">
                            Choose how the application should look.
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <ThemeOption
                          icon={Monitor}
                          title="Light"
                          description="Clean & bright"
                          active={localTheme === "light"}
                          onClick={() =>
                            handleThemeChange("light")
                          }
                        />

                        <ThemeOption
                          icon={Moon}
                          title="Dark"
                          description="Easy on the eyes"
                          active={localTheme === "dark"}
                          onClick={() =>
                            handleThemeChange("dark")
                          }
                        />

                        <ThemeOption
                          icon={Smartphone}
                          title="System"
                          description="Follow your device"
                          active={localTheme === "system"}
                          onClick={() =>
                            handleThemeChange("system")
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>


                  {/* Accent */}
                  <Card className="rounded-2xl border-line shadow-none">
                    <CardHeader className="px-5 pb-2 pt-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-surface-muted text-ink-subtle">
                          <Palette className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-ink">
                            Accent color
                          </h3>

                          <p className="text-[11px] text-ink-subtle">
                            Pick the color used throughout your interface.
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 pb-5 pt-4">
                      <div className="flex flex-wrap gap-5">
                        {accentOptions.map((accent) => (
                          <AccentOption
                            key={accent.value}
                            color={accent.swatch}
                            label={accent.label}
                            selected={
                              localAccent === accent.swatch
                            }
                            onClick={() =>
                              handleAccentChange(
                                accent.swatch,
                              )
                            }
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              )}


              {/* =================================================
                  PRIVACY
              ================================================= */}

              {activeSection === "privacy" && (
                <div className="space-y-5">

                  <div>
                    <SectionLabel>
                      Privacy
                    </SectionLabel>

                    <div className="mb-4">
                      <h2 className="text-2xl font-black tracking-tight text-ink">
                        Your profile. Your rules.
                      </h2>

                      <p className="mt-1 text-xs text-ink-subtle">
                        Decide which profile information other people can see.
                      </p>
                    </div>
                  </div>


                  {/* Privacy header */}
                  <Card className="overflow-hidden rounded-2xl border-line shadow-none">
                    <div className="relative bg-gradient-to-br from-brand/10 via-transparent to-purple-500/10 p-5">
                      <div className="flex items-start gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20">
                          <Shield className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-ink">
                            Public profile visibility
                          </p>

                          <p className="mt-1 max-w-xl text-xs leading-5 text-ink-subtle">
                            These controls determine which information can
                            appear on your public profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>


                  <div className="grid gap-3 sm:grid-cols-2">

                    <VisibilityItem
                      icon={User}
                      title="Avatar"
                      description="Show your avatar publicly."
                      checked={
                        localVisibility.avatar ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "avatar",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Info}
                      title="Bio"
                      description="Show your profile biography."
                      checked={
                        localVisibility.bio ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "bio",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Calendar}
                      title="Date of birth"
                      description="Show your date of birth."
                      checked={
                        localVisibility.dob ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "dob",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Shield}
                      title="Age group"
                      description="Show your age group."
                      checked={
                        localVisibility.age ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "age",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Users}
                      title="Gender"
                      description="Show your gender."
                      checked={
                        localVisibility.gender ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "gender",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Globe}
                      title="Region"
                      description="Show your region."
                      checked={
                        localVisibility.region ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "region",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Globe}
                      title="City"
                      description="Show your city."
                      checked={
                        localVisibility.city ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "city",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Globe}
                      title="Primary language"
                      description="Show your primary language."
                      checked={
                        localVisibility.primaryLanguage ??
                        true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "primaryLanguage",
                          value,
                        )
                      }
                    />

                    <VisibilityItem
                      icon={Globe}
                      title="Languages"
                      description="Show your spoken languages."
                      checked={
                        localVisibility.languages ?? true
                      }
                      onChange={(value) =>
                        handleVisibilityChange(
                          "languages",
                          value,
                        )
                      }
                    />

                  </div>

                </div>
              )}


              {/* =================================================
                  ACCOUNT
              ================================================= */}

              {activeSection === "account" && (
                <div className="space-y-5">

                  <div>
                    <SectionLabel>
                      Account
                    </SectionLabel>

                    <div className="mb-4">
                      <h2 className="text-2xl font-black tracking-tight text-ink">
                        Account control center.
                      </h2>

                      <p className="mt-1 text-xs text-ink-subtle">
                        Manage your profile, security and session.
                      </p>
                    </div>
                  </div>


                  {/* Profile */}
                  <Card className="rounded-2xl border-line shadow-none">
                    <CardHeader className="px-5 pb-3 pt-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
                          <CircleUserRound className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-ink">
                            Profile
                          </h3>

                          <p className="text-[11px] text-ink-subtle">
                            Manage your public identity.
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 pb-5">
                      <SettingsRow
                        icon={User}
                        title="Edit profile"
                        description="Change your username, avatar, bio and personal information."
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() =>
                            navigate("/profile")
                          }
                        >
                          Edit
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </SettingsRow>
                    </CardContent>
                  </Card>


                  {/* Account information */}
                  <Card className="rounded-2xl border-line shadow-none">
                    <CardHeader className="px-5 pb-3 pt-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-surface-muted text-ink-subtle">
                          <Lock className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-ink">
                            Account information
                          </h3>

                          <p className="text-[11px] text-ink-subtle">
                            Information associated with your account.
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-1 px-5 pb-5">

                      <SettingsRow
                        icon={Mail}
                        title="Toli"
                        description="Your toli."
                      >
                        <span className="max-w-[220px] truncate text-xs font-medium text-ink-muted">
                          {"Comming Soon"}
                        </span>
                      </SettingsRow>

                      <SettingsRow
                        icon={Shield}
                        title="Security"
                        description="Your account is protected by secure authentication."
                      >
                        <Badge
                          variant="secondary"
                          className="gap-1 rounded-full text-[10px]"
                        >
                          <Check className="h-3 w-3" />
                          Protected
                        </Badge>
                      </SettingsRow>

                    </CardContent>
                  </Card>


                  {/* Notifications placeholder */}
                  <Card className="rounded-2xl border-line shadow-none">
                    <CardContent className="p-2">

                      <SettingsRow
                        icon={Bell}
                        title="Notifications"
                        description="Notification preferences will be available here."
                      >
                        <Badge
                          variant="outline"
                          className="rounded-full text-[10px]"
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
                          className="rounded-full text-[10px]"
                        >
                          Coming soon
                        </Badge>
                      </SettingsRow>

                    </CardContent>
                  </Card>


                  {/* Logout */}
                  <Card className="rounded-2xl border-danger-soft bg-danger-soft/30 shadow-none">
                    <CardContent className="p-2">

                      <SettingsRow
                        icon={LogOut}
                        title="Sign out"
                        description="Sign out from this device."
                        danger
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                          disabled={logout.isPending}
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {logout.isPending
                            ? "Signing out..."
                            : "Sign out"}
                        </Button>
                      </SettingsRow>

                    </CardContent>
                  </Card>

                </div>
              )}

            </main>
          </div>


          {/* =================================================
              STICKY SAVE BAR
          ================================================= */}

          <div className="mt-4 shrink-0">
            <div
              className={[
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-all",
                hasChanges
                  ? "border-brand/30 bg-brand-soft"
                  : "border-line bg-surface",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                    hasChanges
                      ? "bg-brand text-white"
                      : "bg-surface-muted text-ink-subtle",
                  ].join(" ")}
                >
                  {saved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Settings2 className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">
                    {saved
                      ? "Changes saved successfully"
                      : hasChanges
                        ? "You have unsaved changes"
                        : "Everything is up to date"}
                  </p>

                  <p className="hidden text-[10px] text-ink-subtle sm:block">
                    {hasChanges
                      ? "Save your preferences to sync them across devices."
                      : "Your preferences are synchronized."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                  Reset
                </Button>

                <Button
                  size="sm"
                  className="rounded-xl px-5 text-xs"
                  disabled={
                    !hasChanges ||
                    updateState.isLoading
                  }
                  onClick={handleSave}
                >
                  {updateState.isLoading
                    ? "Saving..."
                    : saved
                      ? "Saved"
                      : "Save changes"}
                </Button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}