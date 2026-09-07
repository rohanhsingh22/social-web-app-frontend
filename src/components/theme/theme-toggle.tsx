"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setThemeMode } from "@/store/ui-slice";
import { Button } from "@/components/ui/button";
import type { AppDispatch, RootState } from "@/store/store";

export function ThemeToggle() {
  const mode = useSelector((state: RootState) => state.ui.theme.mode);
  const dispatch = useDispatch<AppDispatch>();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      setIsDark(
        mode === "system" ? media.matches : mode === "dark",
      );
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [mode]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => dispatch(setThemeMode(isDark ? "light" : "dark"))}
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </Button>
  );
}
