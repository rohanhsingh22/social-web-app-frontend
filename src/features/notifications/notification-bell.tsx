import { Bell } from "lucide-react";
import { useAuthSession } from "@/features/auth/api";
import { useUnreadCount } from "@/features/notifications/api";

export function NotificationBellIcon() {
  const authQuery = useAuthSession();
  const { unreadCount } = useUnreadCount(Boolean(authQuery.data));

  return (
    <span className="relative inline-flex">
      <Bell className="h-5 w-5" aria-hidden />
      {unreadCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-0.5 text-[10px] font-bold leading-none text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </span>
  );
}
