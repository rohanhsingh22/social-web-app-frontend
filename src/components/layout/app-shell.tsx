"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lightbulb, MessageCircle, MessageSquare, Settings, UsersRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { ChannelList } from "@/features/channels/channel-list";
import { useChannels } from "@/features/channels/api";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/thoughts", label: "Thoughts", icon: Lightbulb },
  { href: "/connections", label: "Connections", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const channelsQuery = useChannels();
  const channels = channelsQuery.data ?? [];

  const activeSlug =
    pathname === "/"
      ? channels.find((c) => c.isDefault)?.slug ?? ""
      : pathname.startsWith("/channels/")
        ? pathname.replace("/channels/", "")
        : "";

  return (
    <div className="min-h-dvh bg-background text-ink lg:h-dvh lg:overflow-hidden">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-on-brand shadow-lg shadow-brand/20">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </div>
          <span className="text-base font-bold text-ink">HiRotoli</span>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/home"
                ? pathname === "/home"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-subtle transition-all hover:bg-surface-hover hover:text-ink",
                  active &&
                    "bg-brand-soft font-semibold text-brand-ink hover:bg-brand-soft hover:text-brand-ink",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4">
          <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Channels
          </h3>
          <ChannelList
            activeSlug={activeSlug}
            channels={channels}
            isLoading={channelsQuery.isLoading}
            showHeader={false}
          />
        </div>

        <div className="border-t border-line p-3">
          <UserMenu showName />
        </div>
      </aside>

      <main className="min-h-dvh pb-16 lg:h-full lg:overflow-hidden lg:pb-0 lg:pl-64">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-6 border-t border-line bg-surface/90 backdrop-blur lg:hidden"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/home"
              ? pathname === "/home"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium text-ink-subtle",
                active && "text-brand-ink",
              )}
            >
              <span
                className={clsx(
                  "grid h-8 w-14 place-items-center rounded-full transition-colors",
                  active && "bg-brand-soft",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-ink-subtle">
          <span className="grid h-8 w-14 place-items-center rounded-full">
            <ThemeToggle />
          </span>
          <span>Theme</span>
        </div>
      </nav>
    </div>
  );
}
