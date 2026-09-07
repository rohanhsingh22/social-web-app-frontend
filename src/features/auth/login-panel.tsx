"use client";

import { ProviderLoginButton } from "@/components/auth/provider-login-button";
import { useAuthProvidersQuery } from "@/rtk/auth/auth-api";

export function LoginPanel() {
  const { data: providers = [] } = useAuthProvidersQuery();

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        <div className="bg-gradient-to-br from-brand to-brand-hover p-8 text-on-brand">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 opacity-90">
            Live public channels, connections, and private chat. Sign in to
            join the conversation.
          </p>
        </div>
        <div className="p-8">
          <p className="text-sm leading-6 text-ink-muted">
            Choose a provider to sign in. The backend handles OAuth and
            redirects back after creating your app session.
          </p>
          <div className="mt-5 grid gap-4">
            {providers.map((provider) => (
              <ProviderLoginButton key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
