import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function readThemeColor(token: string): string {
  if (typeof document === "undefined") {
    return "";
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
}

// Live app accent (light/dark + accent switch re-read, like the showcase
// scene). The 3D world stays in sync with UI preferences without coupling
// the HomeWorldTheme contract to them.
export function useAccentColor(fallback = "#ff2e63"): string {
  const [color, setColor] = useState(() => readThemeColor("--brand") || fallback);

  useEffect(() => {
    const refresh = () => setColor(readThemeColor("--brand") || fallback);
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-accent"],
    });
    return () => observer.disconnect();
  }, [fallback]);

  return color;
}

// Resolved UI color mode (ground truth: the `dark` class applyTheme sets
// on <html>, covering light/dark/system). The 3D world follows UI switches
// live, including OS-level system changes.
export function useUiColorMode(): "light" | "dark" {
  const read = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? ("dark" as const)
      : ("light" as const);
  const [mode, setMode] = useState(read);

  useEffect(() => {
    const refresh = () => setMode(read());
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", refresh);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", refresh);
    };
  }, []);

  return mode;
}

export function useTabVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}
