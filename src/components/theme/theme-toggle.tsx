import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setThemeMode } from "@/store/ui-slice";
import { Button } from "@/components/ui/button";
import type { AppDispatch, RootState } from "@/store/store";
import type { ThemeMode } from "@/lib/theme";
import { useUpdateSettingsMutation } from "@/rtk/settings/settings-api";

export function useThemeMode() {
  const mode = useSelector((state: RootState) => state.ui.theme.mode);
  const dispatch = useDispatch<AppDispatch>();
  const [updateSettings] = useUpdateSettingsMutation();

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      dispatch(setThemeMode(newMode));
      updateSettings({ theme: newMode });
    },
    [dispatch, updateSettings],
  );

  return { mode, setMode };
}

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      setIsDark(mode === "system" ? media.matches : mode === "dark");
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
      onClick={() => setMode(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </Button>
  );
}
