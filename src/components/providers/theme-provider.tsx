"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  applyTheme,
  readStoredTheme,
  writeStoredTheme,
} from "@/lib/theme";
import { setTheme } from "@/store/ui-slice";
import type { AppDispatch, RootState } from "@/store/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useRef(false);

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      dispatch(setTheme(stored));
    }
  }, [dispatch]);

  useEffect(() => {
    applyTheme(theme);

    if (initialized.current) {
      writeStoredTheme(theme);
    }
    initialized.current = true;
  }, [theme]);

  useEffect(() => {
    if (theme.mode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(theme);

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return <>{children}</>;
}
