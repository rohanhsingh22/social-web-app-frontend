"use client";

import { LockKeyhole } from "lucide-react";
import { ProviderLoginButton } from "@/components/auth/provider-login-button";
import { useAuthProvidersQuery } from "@/rtk/auth/auth-api";

export function LockedPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const { data: providers = [] } = useAuthProvidersQuery();
  const firstProvider = providers[0];

  return (
    <section className="grid min-h-dvh place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-lg">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
          <LockKeyhole className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
        <div className="mt-6">
          {firstProvider ? <ProviderLoginButton provider={firstProvider} /> : null}
        </div>
      </div>
    </section>
  );
}
