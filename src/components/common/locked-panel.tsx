"use client";

import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LockedPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const router = useRouter();

  return (
    <section className="grid min-h-dvh place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-lg">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
          <LockKeyhole className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
        <div className="mt-6">
          <Button onClick={() => router.push("/login")} className="w-full gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </div>
      </div>
    </section>
  );
}
