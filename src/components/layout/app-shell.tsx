"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, UserRound, UsersRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
  { href: "/", label: "Channels", icon: MessageCircle },
  { href: "/connections", label: "Connections", icon: UsersRound },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-background text-ink lg:h-dvh lg:overflow-hidden">
      <aside className="fixed inset-y-0 left-0 hidden w-20 border-r border-line bg-surface lg:flex lg:flex-col lg:items-center lg:py-4">
        <Link
          href="/"
          className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-on-brand shadow-lg shadow-brand/20 transition-transform hover:scale-105"
          aria-label="Open channels"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </Link>
        <nav className="flex flex-1 flex-col gap-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/channels")
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "grid h-12 w-12 place-items-center rounded-xl text-ink-subtle transition-all hover:bg-surface-hover hover:text-ink",
                  active &&
                    "bg-brand-soft text-brand-ink hover:bg-brand-soft hover:text-brand-ink",
                )}
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </aside>

      <main className="min-h-dvh pb-16 lg:h-full lg:overflow-hidden lg:pb-0 lg:pl-20">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-4 border-t border-line bg-surface/90 backdrop-blur lg:hidden"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/channels")
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
