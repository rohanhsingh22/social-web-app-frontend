import { LogOut, Moon, Sun, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuthSession, useLogout } from "@/features/auth/api";
import { useThemeMode } from "@/components/theme/theme-toggle";
import { HirotoliId } from "@/components/common/hirotoli-id";
import { UserAvatar } from "@/components/common/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <UserAvatar user={user} size={40} fallback="initial" />
          {showName ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
              <p className="truncate text-xs text-ink-subtle">
                <HirotoliId
                  publicUserId={user.publicUserId}
                  username={user.username}
                />
              </p>
            </div>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-56">
        <div className="flex items-center gap-3 p-2">
          <UserAvatar user={user} size={48} fallback="initial" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
            <p className="truncate text-xs text-ink-subtle">
              <HirotoliId
                publicUserId={user.publicUserId}
                username={user.username}
              />
            </p>
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
