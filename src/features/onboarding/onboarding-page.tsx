import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { useMyProfile, useUpdateMyProfile } from "@/features/profile/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function OnboardingPage() {
  const navigate = useNavigate();
  const authQuery = useAuthSession();
  const profileQuery = useMyProfile(Boolean(authQuery.data));
  const updateProfile = useUpdateMyProfile();
  const profile = profileQuery.data;
  const initializedRef = useRef(false);

  const [form, setForm] = useState({
    username: profile?.username ?? "",
    dob: profile?.dob ?? "",
    region: profile?.region ?? "",
    primaryLanguage: profile?.primaryLanguage ?? "English",
  });

  const canSubmit =
    form.username.trim().length >= 3 &&
    form.dob.trim().length > 0 &&
    form.region.trim().length > 0 &&
    form.primaryLanguage.trim().length > 0;

  useEffect(() => {
    if (profile && !initializedRef.current) {
      initializedRef.current = true;
      setForm({
        username: profile.username ?? "",
        dob: profile.dob ?? "",
        region: profile.region ?? "",
        primaryLanguage: profile.primaryLanguage ?? "English",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.isComplete) {
      navigate("/profile", { replace: true });
    }
  }, [profile?.isComplete, navigate]);

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

    navigate("/profile");
  }

  if (authQuery.isLoading || profileQuery.isLoading) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-lg border border-line bg-surface p-5 text-sm text-ink-muted">
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
          message="Login to complete your profile setup."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-ink">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Required after first Facebook login when username, age confirmation,
            region, or preferred language is missing.
          </p>
          <form className="mt-6 grid gap-4">
            <Label htmlFor="username" className="grid gap-2">
              <span>Username</span>
              <Input
                id="username"
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({ ...current, username: event.target.value }))
                }
                placeholder="your_username"
              />
            </Label>
            <Label htmlFor="dob" className="grid gap-2">
              <span>Date of birth</span>
              <Input
                id="dob"
                value={form.dob}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dob: event.target.value }))
                }
                type="date"
              />
            </Label>
            <Label htmlFor="region" className="grid gap-2">
              <span>Region</span>
              <Input
                id="region"
                value={form.region}
                onChange={(event) =>
                  setForm((current) => ({ ...current, region: event.target.value }))
                }
                placeholder="India"
              />
            </Label>
            <Label htmlFor="language" className="grid gap-2">
              <span>Preferred language</span>
              <Select
                id="language"
                value={form.primaryLanguage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    primaryLanguage: event.target.value,
                  }))
                }
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Telugu</option>
                <option>Bengali</option>
                <option>Marathi</option>
              </Select>
            </Label>
            {updateProfile.isError ? (
              <p className="rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
                Could not save profile. Please check the backend response and try
                again.
              </p>
            ) : null}
            <Button
              type="button"
              onClick={submit}
              disabled={!canSubmit || updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
