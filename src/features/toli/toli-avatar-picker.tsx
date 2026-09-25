import { useEffect, useState } from "react";
import { Check, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveToliAvatarImage, toliAvatarSwatch } from "@/lib/toli-avatar";

export const PROVIDER_AVATAR_VALUE = "__provider";

export function ToliAvatarPicker({
  avatars,
  toliName,
  value,
  onChange,
  disabled = false,
  providerAvatarUrl = null,
}: {
  avatars: string[];
  toliName: string;
  value: string | null;
  onChange: (avatarKey: string | null) => void;
  disabled?: boolean;
  providerAvatarUrl?: string | null;
}) {
  const [providerFailed, setProviderFailed] = useState(false);

  useEffect(() => {
    setProviderFailed(false);
  }, [providerAvatarUrl]);

  const showProviderPhoto = Boolean(providerAvatarUrl) && !providerFailed;
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
            "grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 bg-surface-muted text-ink-subtle transition-all disabled:opacity-50",
            value === PROVIDER_AVATAR_VALUE
              ? "border-brand"
              : "border-transparent hover:border-line-strong",
          )}
        >
          {showProviderPhoto ? (
            <img
              src={providerAvatarUrl ?? undefined}
              alt="Login photo"
              loading="lazy"
              onError={() => setProviderFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5" aria-hidden />
          )}
        </button>
        {avatars.map((key) => {
          const active = value === key;
          const label = key.split("_").pop() ?? key;
          const src = resolveToliAvatarImage(key);
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(active ? null : key)}
              title={key}
              aria-pressed={active}
              className={cn(
                "relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 text-sm font-black transition-all disabled:opacity-50",
                src ? "" : toliAvatarSwatch(key),
                active
                  ? "border-brand"
                  : "border-transparent hover:border-line-strong",
              )}
            >
              {src ? (
                <img
                  src={src}
                  alt={`${toliName} avatar ${label}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                label
              )}
              {active ? (
                <Check
                  className="absolute h-4 w-4 rounded-full bg-surface/80"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
