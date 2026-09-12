// "use client";

// import { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { applyTheme, readStoredTheme } from "@/lib/theme";
// import { setTheme } from "@/store/ui-slice";
// import type { AppDispatch, RootState } from "@/store/store";
// import { useSettingsQuery } from "@/rtk/settings/settings-api";
// import { accentOptions } from "@/lib/theme";
// import { useAuthSession } from "@/features/auth/api";

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const theme = useSelector((state: RootState) => state.ui.theme);
//   const dispatch = useDispatch<AppDispatch>();
//   const authQuery = useAuthSession();
//   const isLoggedIn = Boolean(authQuery.data);
//   const isAuthLoading = authQuery.isLoading;
//   const initialized = useRef(false);

//   const { data: settings } = useSettingsQuery(undefined, {
//     skip: !isLoggedIn || isAuthLoading,
//   });

//   // Initialize theme from settings (logged in) or localStorage (guest)
//   useEffect(() => {
//     // Only apply theme after auth has resolved
//     if (isAuthLoading) return;

//     if (isLoggedIn && settings) {
//       // Logged in: use settings from API only on first load
//       if (initialized.current) return;
//       initialized.current = true;
//       const accentValue =
//         accentOptions.find((a) => a.swatch === settings.accentColor)?.value ??
//         "rose";
//       dispatch(
//         setTheme({
//           mode: settings.theme,
//           accent: accentValue,
//         }),
//       );
//     } else if (!isLoggedIn) {
//       // Guest: use localStorage
//       const stored = readStoredTheme();
//       if (stored) {
//         dispatch(setTheme(stored));
//       }
//     }
//   }, [settings, isLoggedIn, isAuthLoading, dispatch]);

//   useEffect(() => {
//     applyTheme(theme);
//   }, [theme]);

//   useEffect(() => {
//     if (theme.mode !== "system") {
//       return;
//     }

//     const media = window.matchMedia("(prefers-color-scheme: dark)");
//     const onChange = () => applyTheme(theme);

//     media.addEventListener("change", onChange);
//     return () => media.removeEventListener("change", onChange);
//   }, [theme]);

//   return <>{children}</>;
// }
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  applyTheme,
  readStoredTheme,
  writeStoredTheme,
  accentOptions,
  type ThemeState,
} from "@/lib/theme";

import { setTheme } from "@/store/ui-slice";
import type { AppDispatch, RootState } from "@/store/store";

import { useSettingsQuery } from "@/rtk/settings/settings-api";
import { useAuthSession } from "@/features/auth/api";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const theme = useSelector((state: RootState) => state.ui.theme);

  /*
   * -------------------------------------------------------
   * 1. Check authentication
   * -------------------------------------------------------
   */
  const authQuery = useAuthSession();

  const isLoggedIn = Boolean(authQuery.data);
  const isAuthLoading = authQuery.isLoading;

  /*
   * -------------------------------------------------------
   * 2. Fetch server settings
   *
   * We only fetch settings after authentication succeeds.
   * -------------------------------------------------------
   */
  const { data: settings } = useSettingsQuery(undefined, {
    skip: !isLoggedIn || isAuthLoading,
  });

  /*
   * -------------------------------------------------------
   * 3. FIRST STEP: Load localStorage immediately
   *
   * This does NOT wait for authentication.
   *
   * Flow:
   *
   * App opens
   *     ↓
   * localStorage
   *     ↓
   * Redux
   *     ↓
   * applyTheme
   * -------------------------------------------------------
   */
  useEffect(() => {
    const storedTheme = readStoredTheme();

    if (!storedTheme) {
      return;
    }

    dispatch(setTheme(storedTheme));
  }, [dispatch]);

  /*
   * -------------------------------------------------------
   * 4. SECOND STEP: Apply server theme
   *
   * This runs only after:
   *
   * - authentication has completed
   * - user is logged in
   * - settings API has returned
   *
   * Server theme becomes the source of truth.
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isLoggedIn) {
      return;
    }

    if (!settings) {
      return;
    }

    const accentValue =
      accentOptions.find(
        (accent) => accent.swatch === settings.accentColor,
      )?.value ?? "rose";

    const serverTheme: ThemeState = {
      mode: settings.theme,
      accent: accentValue,
    };

    /*
     * Update Redux with server theme.
     */
    dispatch(setTheme(serverTheme));

    /*
     * Keep localStorage synchronized with the server.
     *
     * This means the next time the app opens,
     * localStorage will already contain the latest theme.
     */
    writeStoredTheme(serverTheme);
  }, [
    settings,
    isLoggedIn,
    isAuthLoading,
    dispatch,
  ]);

  /*
   * -------------------------------------------------------
   * 5. Whenever Redux theme changes,
   *    apply it to the document.
   *
   * Flow:
   *
   * localStorage
   *      ↓
   * Redux
   *      ↓
   * applyTheme
   *
   * OR
   *
   * Server
   *      ↓
   * Redux
   *      ↓
   * applyTheme
   * -------------------------------------------------------
   */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /*
   * -------------------------------------------------------
   * 6. Handle system theme changes
   *
   * Only relevant when:
   *
   * theme.mode === "system"
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (theme.mode !== "system") {
      return;
    }

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleChange = () => {
      applyTheme(theme);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [theme]);

  return <>{children}</>;
}