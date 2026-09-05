"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, UserRound, UsersRound } from "lucide-react";

const navItems = [
  { href: "/", label: "Channels", icon: MessageCircle },
  { href: "/connections", label: "Connections", icon: UsersRound },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-20 border-r border-slate-200 bg-white lg:flex lg:flex-col lg:items-center lg:py-4">
        <Link
          href="/"
          className="mb-6 grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-white"
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
                  "grid h-12 w-12 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950",
                  active && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                )}
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-h-dvh pb-16 lg:pl-20 lg:pb-0">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-3 border-t border-slate-200 bg-white lg:hidden"
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
                "flex flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500",
                active && "text-slate-950",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
