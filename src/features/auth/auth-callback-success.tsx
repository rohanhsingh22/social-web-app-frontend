"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuthSession, useRefreshSessionMutation } from "@/features/auth/api";
import { Button } from "@/components/ui/button";

export function AuthCallbackSuccess() {
  const router = useRouter();
  const authQuery = useAuthSession();
  const profile = authQuery.data?.profile;
  const [refreshSession] = useRefreshSessionMutation();

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      await refreshSession();

      if (cancelled) {
        return;
      }

      if (profile && !profile.isComplete) {
        router.replace("/onboarding");
        return;
      }

      router.replace("/channels");
    }

    if (authQuery.data) {
      initSession();
    }

    return () => {
      cancelled = true;
    };
  }, [authQuery.data, profile, router, refreshSession]);

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success-ink">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-ink">Login complete</h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Loading your app session. If required profile fields are missing, you
          will continue to onboarding.
        </p>
        {authQuery.isError ? (
          <p className="mt-4 rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
            Could not load `/auth/me`. Please check the backend session cookie or
            token response.
          </p>
        ) : null}
        <Button asChild className="mt-6 w-full">
          <Link href="/">Continue to chat</Link>
        </Button>
      </section>
    </main>
  );
}
