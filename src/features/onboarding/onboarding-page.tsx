"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { useUpdateMyProfile } from "@/features/profile/api";

export function OnboardingPage() {
  const router = useRouter();
  const authQuery = useAuthSession();
  const updateProfile = useUpdateMyProfile();
  const [form, setForm] = useState({
    username: "",
    dob: "",
    region: "",
    primaryLanguage: "English",
  });

  const canSubmit =
    form.username.trim().length >= 3 &&
    form.dob.trim().length > 0 &&
    form.region.trim().length > 0 &&
    form.primaryLanguage.trim().length > 0;

  useEffect(() => {
    if (authQuery.data?.profile?.isComplete) {
      router.replace("/profile");
    }
  }, [authQuery.data?.profile?.isComplete, router]);

  async function submit() {
    if (!authQuery.data || !canSubmit) {
      return;
    }

    await updateProfile.mutateAsync({
      username: form.username.trim(),
      dob: form.dob,
      region: form.region.trim(),
      primaryLanguage: form.primaryLanguage,
      languages: [form.primaryLanguage],
    });

    router.push("/profile");
  }

  if (authQuery.isLoading) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Checking session...
          </div>
        </section>
      </AppShell>
    );
  }

  if (!authQuery.data) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Onboarding starts after Facebook login creates an app session."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h1 className="text-2xl font-semibold text-slate-950">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Required after first Facebook login when username, age confirmation,
            region, or preferred language is missing.
          </p>
          <form className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Username
              <input
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({ ...current, username: event.target.value }))
                }
                className="h-11 rounded-md border border-slate-200 px-3 text-sm"
                placeholder="your_username"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Date of birth
              <input
                value={form.dob}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dob: event.target.value }))
                }
                type="date"
                className="h-11 rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Region
              <input
                value={form.region}
                onChange={(event) =>
                  setForm((current) => ({ ...current, region: event.target.value }))
                }
                className="h-11 rounded-md border border-slate-200 px-3 text-sm"
                placeholder="India"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Preferred language
              <select
                value={form.primaryLanguage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    primaryLanguage: event.target.value,
                  }))
                }
                className="h-11 rounded-md border border-slate-200 px-3 text-sm"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Telugu</option>
                <option>Bengali</option>
                <option>Marathi</option>
              </select>
            </label>
            {updateProfile.isError ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Could not save profile. Please check the backend response and try
                again.
              </p>
            ) : null}
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || updateProfile.isPending}
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {updateProfile.isPending ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
