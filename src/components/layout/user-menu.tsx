import { LogOut, Moon, Sun, Settings } from "lucide-react";
import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarColor } from "@/lib/channel-colors";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuthSession, useLogout } from "@/features/auth/api";
import { useThemeMode } from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserSummary } from "@/types/domain";

function SquareAvatar({ user }: { user: UserSummary }) {
  const color = avatarColor(user.displayName || user.username || user.id);

  return (
    <AvatarPrimitive className="h-12 w-12 rounded-md">
      <AvatarImage src={user.avatarUrl} alt={user.displayName} className="object-cover" />
      <AvatarFallback className={cn("rounded-md font-semibold", color.bg, color.text)}>
        {(user.displayName || "?").slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </AvatarPrimitive>
  );
}

export function UserMenu({ showName = false }: { showName?: boolean }) {
  const navigate = useNavigate();
  const authQuery = useAuthSession();
  const { mutateAsync: logout } = useLogout();
  const { mode, setMode } = useThemeMode();
  const user = authQuery.data?.user;

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout mutation handles token clearing regardless
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left outline-none ring-offset-2 transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand",
            !showName && "rounded-full",
          )}
          aria-label="User menu"
        >
          <AvatarTrigger user={user} />
          {showName ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
              <p className="truncate text-xs text-ink-subtle">@{user.username}</p>
            </div>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-56">
        <div className="flex items-center gap-3 p-2">
          <SquareAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
            <p className="truncate text-xs text-ink-subtle">@{user.username}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer justify-between"
          onSelect={(e) => {
            e.preventDefault();
            setMode(mode === "dark" ? "light" : "dark");
          }}
        >
          <span className="flex items-center gap-2">
            {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {mode === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => navigate("/settings")}
        >
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onSelect={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AvatarTrigger({ user }: { user: UserSummary }) {
  const color = avatarColor(user.displayName || user.username || user.id);

  return (
    <AvatarPrimitive className="h-10 w-10 rounded-full">
      <AvatarImage src={user.avatarUrl} alt={user.displayName} className="object-cover" />
      <AvatarFallback className={cn("rounded-full font-semibold text-sm", color.bg, color.text)}>
        {(user.displayName || "?").slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </AvatarPrimitive>
  );
}
