import { useEffect, useState } from "react";
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
  const [failed, setFailed] = useState(false);

  // Reset the error flag whenever the source changes so a fresh URL retries.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        "showcase-avatar relative shrink-0 border-[3px] border-brand bg-brand/10",
        className,
      )}
      style={{ width, height }}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={alt}
          onError={() => setFailed(true)}
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
