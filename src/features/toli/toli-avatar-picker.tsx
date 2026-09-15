import { Check, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toliAvatarSwatch } from "@/lib/toli-avatar";

export const PROVIDER_AVATAR_VALUE = "__provider";

export function ToliAvatarPicker({
  avatars,
  toliName,
  value,
  onChange,
  disabled = false,
}: {
  avatars: string[];
  toliName: string;
  value: string | null;
  onChange: (avatarKey: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-xs text-ink-muted">
        Choose your {toliName} avatar, or keep your login photo.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(PROVIDER_AVATAR_VALUE)}
          title="Use login photo"
          aria-pressed={value === PROVIDER_AVATAR_VALUE}
          className={cn(
            "grid h-14 w-14 place-items-center rounded-full border-2 bg-surface-muted text-ink-subtle transition-all disabled:opacity-50",
            value === PROVIDER_AVATAR_VALUE
              ? "border-brand"
              : "border-transparent hover:border-line-strong",
          )}
        >
          <ImageIcon className="h-5 w-5" aria-hidden />
        </button>
        {avatars.map((key) => {
          const active = value === key;
          const label = key.split("_").pop() ?? key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(active ? null : key)}
              title={key}
              aria-pressed={active}
              className={cn(
                "relative grid h-14 w-14 place-items-center rounded-full border-2 text-sm font-black transition-all disabled:opacity-50",
                toliAvatarSwatch(key),
                active
                  ? "border-brand"
                  : "border-transparent hover:border-line-strong",
              )}
            >
              {label}
              {active ? (
                <Check className="absolute h-4 w-4" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
