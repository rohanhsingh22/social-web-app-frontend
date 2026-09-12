import clsx from "clsx";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { accentOptions, themeModes } from "@/lib/theme";
import { setThemeAccent, setThemeMode } from "@/store/ui-slice";
import { Button } from "@/components/ui/button";
import type { AppDispatch, RootState } from "@/store/store";
import { useUpdateSettingsMutation } from "@/rtk/settings/settings-api";

export function ThemeControls() {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dispatch = useDispatch<AppDispatch>();
  const [updateSettings] = useUpdateSettingsMutation();

  const handleModeChange = (mode: (typeof themeModes)[number]["value"]) => {
    dispatch(setThemeMode(mode));
    updateSettings({ theme: mode });
  };

  const handleAccentChange = (accent: (typeof accentOptions)[number]["value"]) => {
    dispatch(setThemeAccent(accent));
    const swatch = accentOptions.find((a) => a.value === accent)?.swatch;
    if (swatch) {
      updateSettings({ accentColor: swatch });
    }
  };

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-base font-semibold text-ink">Appearance</h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Choose a light, dark, or system theme.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {themeModes.map((mode) => {
            const Icon =
              mode.value === "light" ? Sun : mode.value === "dark" ? Moon : Monitor;
            const active = theme.mode === mode.value;

            return (
              <Button
                key={mode.value}
                type="button"
                variant={active ? "default" : "outline"}
                onClick={() => handleModeChange(mode.value)}
                aria-pressed={active}
                className="gap-2"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {mode.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-ink">Accent color</h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Used for buttons, links, and highlights.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          {accentOptions.map((accent) => {
            const active = theme.accent === accent.value;

            return (
              <button
                key={accent.value}
                type="button"
                onClick={() => handleAccentChange(accent.value)}
                className="flex items-center gap-2"
                aria-label={`${accent.label} accent`}
                aria-pressed={active}
              >
                <span
                  className={clsx(
                    "grid h-9 w-9 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform hover:scale-110",
                    active ? "ring-brand" : "ring-line",
                  )}
                  style={{ backgroundColor: accent.swatch }}
                >
                  {active ? (
                    <Check className="h-4 w-4 text-on-brand" aria-hidden />
                  ) : null}
                </span>
                <span className="text-sm font-medium text-ink-muted">
                  {accent.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
