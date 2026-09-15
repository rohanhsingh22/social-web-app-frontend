import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import {
  useLazyDisplayNameAvailabilityQuery,
  useMyProfile,
  useUpdateMyProfile,
  useUpdateProfilePictureMutation,
} from "@/features/profile/api";
import { useTolisQuery, useSelectToliMutation } from "@/features/toli/api";
import { ToliPicker } from "@/features/toli/toli-picker";
import {
  ToliAvatarPicker,
  PROVIDER_AVATAR_VALUE,
} from "@/features/toli/toli-avatar-picker";
import { skipToken } from "@reduxjs/toolkit/query";
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
    displayName: profile?.displayName ?? "",
    dob: profile?.dob ?? "",
    region: profile?.region ?? "",
    primaryLanguage: profile?.primaryLanguage ?? "English",
  });
  const [toliId, setToliId] = useState<string | null>(
    profile?.toli?.id ?? null,
  );
  const [avatarKey, setAvatarKey] = useState<string | null>(
    profile?.profilePicture?.toliAvatarKey ?? null,
  );
  const [checkDisplayName, availabilityQuery] =
    useLazyDisplayNameAvailabilityQuery();
  const tolisQuery = useTolisQuery(
    authQuery.data ? undefined : skipToken,
  );
  const [selectToli, selectToliState] = useSelectToliMutation();
  const [updatePicture, updatePictureState] =
    useUpdateProfilePictureMutation();

  const displayNameTrimmed = form.displayName.trim();
  const displayNameUnchanged =
    displayNameTrimmed === (profile?.displayName ?? "");
  const availabilityForCurrentInput =
    availabilityQuery.originalArgs === displayNameTrimmed
      ? availabilityQuery.data
      : undefined;
  const displayNameChecking =
    !displayNameUnchanged &&
    displayNameTrimmed.length > 0 &&
    (!availabilityForCurrentInput || availabilityQuery.isFetching);
  const displayNameTaken =
    !displayNameUnchanged &&
    availabilityForCurrentInput !== undefined &&
    !availabilityForCurrentInput.available;

  const canSubmit =
    form.username.trim().length >= 3 &&
    displayNameTrimmed.length >= 1 &&
    !displayNameTaken &&
    !displayNameChecking &&
    form.dob.trim().length > 0 &&
    form.region.trim().length > 0 &&
    form.primaryLanguage.trim().length > 0;

  useEffect(() => {
    if (profile && !initializedRef.current) {
      initializedRef.current = true;
      setForm({
        username: profile.username ?? "",
        displayName: profile.displayName ?? "",
        dob: profile.dob ?? "",
        region: profile.region ?? "",
        primaryLanguage: profile.primaryLanguage ?? "English",
      });
      setToliId(profile.toli?.id ?? null);
      setAvatarKey(profile.profilePicture?.toliAvatarKey ?? null);
    }
  }, [profile]);

  useEffect(() => {
    if (displayNameUnchanged || displayNameTrimmed.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      void checkDisplayName(displayNameTrimmed);
    }, 500);

    return () => clearTimeout(timer);
  }, [displayNameTrimmed, displayNameUnchanged, checkDisplayName]);

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
      displayName: displayNameTrimmed,
      dob: form.dob,
      region: form.region.trim(),
      primaryLanguage: form.primaryLanguage,
      languages: [form.primaryLanguage],
    });

    // Toli selection is optional; only call when it changed.
    if (toliId !== (profile?.toli?.id ?? null)) {
      await selectToli({ toliId }).unwrap();
    }

    // Picture follows membership: a Toli avatar needs the new Toli in place.
    if (toliId && avatarKey && avatarKey !== PROVIDER_AVATAR_VALUE) {
      await updatePicture({ type: "toli", avatarKey }).unwrap();
    } else if (
      avatarKey === PROVIDER_AVATAR_VALUE &&
      profile?.profilePicture?.type === "toli"
    ) {
      await updatePicture({ type: "provider" }).unwrap();
    }

    navigate("/profile");
  }

  const targetedToli = tolisQuery.data?.find((toli) => toli.id === toliId);
  const saving =
    updateProfile.isPending ||
    selectToliState.isLoading ||
    updatePictureState.isLoading;
  const saveFailed =
    updateProfile.isError ||
    selectToliState.isError ||
    updatePictureState.isError;

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
            Required after first login when display name, username, age
            confirmation, region, or preferred language is missing.
          </p>
          <form className="mt-6 grid gap-4">
            <Label htmlFor="displayName" className="grid gap-2">
              <span>Display name</span>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, displayName: event.target.value }))
                }
                placeholder="Rohan"
                maxLength={80}
              />
              {displayNameChecking ? (
                <span className="text-xs text-ink-muted">Checking availability...</span>
              ) : null}
              {!displayNameChecking && !displayNameUnchanged && availabilityForCurrentInput?.available ? (
                <span className="text-xs text-emerald-600">Display name is available.</span>
              ) : null}
              {displayNameTaken ? (
                <span className="text-xs text-danger-ink">
                  This display name is taken. Names are case-insensitive.
                </span>
              ) : null}
            </Label>
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
            <div className="grid gap-2">
              <span className="text-sm font-medium">Choose your Toli (optional)</span>
              {tolisQuery.isLoading ? (
                <p className="text-xs text-ink-muted">Loading Tolies...</p>
              ) : (
                <ToliPicker
                  tolis={tolisQuery.data ?? []}
                  value={toliId}
                  onChange={(id) => {
                    setToliId(id);
                    setAvatarKey(null);
                  }}
                />
              )}
            </div>
            {targetedToli ? (
              <div className="grid gap-2">
                <span className="text-sm font-medium">Pick your avatar</span>
                <ToliAvatarPicker
                  avatars={targetedToli.avatars}
                  toliName={targetedToli.name}
                  value={avatarKey}
                  onChange={setAvatarKey}
                />
              </div>
            ) : null}
            {saveFailed ? (
              <p className="rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
                Could not save profile. Please check the backend response and try
                again.
              </p>
            ) : null}
            <Button
              type="button"
              onClick={submit}
              disabled={!canSubmit || saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
