import type { UserSummary } from "@/types/domain";

export function Avatar({ user, size = "md" }: { user: UserSummary; size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };

  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className={`${dimensions[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${dimensions[size]} grid shrink-0 place-items-center rounded-full bg-slate-200 font-semibold text-slate-700`}
      aria-hidden
    >
      {user.displayName.slice(0, 1).toUpperCase()}
    </span>
  );
}
