"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuthSession } from "@/features/auth/api";

export function AuthCallbackSuccess() {
  const router = useRouter();
  const authQuery = useAuthSession();
  const profile = authQuery.data?.profile;

  useEffect(() => {
    if (!authQuery.data) {
      return;
    }

    if (profile && !profile.isComplete) {
      router.replace("/onboarding");
      return;
    }

    router.replace("/");
  }, [authQuery.data, profile, router]);

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <CheckCircle2 className="mb-4 h-9 w-9 text-emerald-600" aria-hidden />
        <h1 className="text-xl font-semibold text-slate-950">Login complete</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Loading your app session. If required profile fields are missing, you
          will continue to onboarding.
        </p>
        {authQuery.isError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Could not load `/auth/me`. Please check the backend session cookie or
            token response.
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
        >
          Continue to chat
        </Link>
      </section>
    </main>
  );
}
