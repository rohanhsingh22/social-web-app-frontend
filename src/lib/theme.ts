export type ThemeMode = "light" | "dark" | "system";
export type Accent = "rose" | "violet" | "blue" | "emerald" | "amber";

export type ThemeState = {
  mode: ThemeMode;
  accent: Accent;
};

export const DEFAULT_THEME: ThemeState = {
  mode: "system",
  accent: "rose",
};

export const THEME_STORAGE_KEY = "social-chat-theme";

export const themeModes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export const accentOptions = [
  { value: "rose", label: "Rose", swatch: "#ff2e63" },
  { value: "violet", label: "Violet", swatch: "#7c3aed" },
  { value: "blue", label: "Blue", swatch: "#2563eb" },
  { value: "emerald", label: "Emerald", swatch: "#10b981" },
  { value: "amber", label: "Amber", swatch: "#f59e0b" },
] as const;

export function readStoredTheme(): ThemeState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ThemeState>;

    const mode: ThemeMode =
      parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "system"
        ? parsed.mode
        : DEFAULT_THEME.mode;

    const accent: Accent = accentOptions.some((option) => option.value === parsed.accent)
      ? (parsed.accent as Accent)
      : DEFAULT_THEME.accent;

    return { mode, accent };
  } catch {
    return null;
  }
}

export function writeStoredTheme(theme: ThemeState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function applyTheme(theme: ThemeState) {
  if (typeof document === "undefined") {
    return;
  }

  const resolved =
    theme.mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme.mode;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.setAttribute("data-accent", theme.accent);
}
