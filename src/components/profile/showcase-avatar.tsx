import { cn } from "@/lib/utils";

type ShowcaseAvatarProps = {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export function ShowcaseAvatar({
  src,
  alt,
  width = 56,
  height = 56,
  className,
}: ShowcaseAvatarProps) {
  const initial = alt.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "showcase-avatar relative shrink-0 border-[3px] border-brand bg-brand/10",
        className,
      )}
      style={{ width, height }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-2xl font-bold text-brand">
          {initial}
        </div>
      )}
    </div>
  );
}
