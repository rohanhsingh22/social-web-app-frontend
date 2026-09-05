"use client";

import { Edit3, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/common/avatar";
import { LockedPanel } from "@/components/common/locked-panel";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthSession } from "@/features/auth/api";
import { useMyProfile, useUpdateMyProfile } from "@/features/profile/api";
import type { Profile } from "@/types/domain";

type ProfileFormState = {
  username: string;
  displayName: string;
  bio: string;
  region: string;
  city: string;
  gender: string;
  primaryLanguage: string;
  languages: string;
};

function toFormState(profile: Profile): ProfileFormState {
  return {
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    region: profile.region ?? "",
    city: profile.city ?? "",
    gender: profile.gender ?? "",
    primaryLanguage: profile.primaryLanguage ?? "",
    languages: profile.languages.join(", "),
  };
}

export function ProfilePage() {
  const authQuery = useAuthSession();
  const isLoggedIn = Boolean(authQuery.data);
  const profileQuery = useMyProfile(isLoggedIn);
  const updateProfile = useUpdateMyProfile();
  const profile = profileQuery.data ?? authQuery.data?.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState | null>(null);

  if (authQuery.isLoading) {
    return (
      <AppShell>
        <section className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Loading profile...
          </div>
        </section>
      </AppShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppShell>
        <LockedPanel
          title="Login required"
          message="Your profile opens after Facebook login. Guests cannot view or edit private profile details."
        />
      </AppShell>
    );
  }

  if (profileQuery.isLoading || !profile) {
    return (
      <AppShell>
        <section className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Loading your profile details...
          </div>
        </section>
      </AppShell>
    );
  }

  if (profileQuery.isError && !profile) {
    return (
      <AppShell>
        <section className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Could not load your profile. Please try again.
          </div>
        </section>
      </AppShell>
    );
  }

  async function saveProfile() {
    if (!form) {
      return;
    }

    await updateProfile.mutateAsync({
      username: form.username.trim(),
      displayName: form.displayName.trim(),
      bio: form.bio.trim(),
      region: form.region.trim(),
      city: form.city.trim(),
      gender: form.gender.trim(),
      primaryLanguage: form.primaryLanguage.trim(),
      languages: form.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setIsEditing(false);
    setForm(null);
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <Avatar user={profile} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-slate-950">
                {profile.displayName}
              </h1>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              {!profile.isComplete ? (
                <p className="mt-2 inline-flex rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                  Profile incomplete
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setForm(null);
                  return;
                }

                setForm(toFormState(profile));
                setIsEditing(true);
              }}
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700"
              aria-label={isEditing ? "Close profile editor" : "Edit profile"}
            >
              {isEditing ? (
                <X className="h-4 w-4" aria-hidden />
              ) : (
                <Edit3 className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          {isEditing && form ? (
            <form className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Display name"
                  value={form.displayName}
                  onChange={(value) =>
                    setForm((current) =>
                      current ? { ...current, displayName: value } : current,
                    )
                  }
                />
                <ProfileField
                  label="Username"
                  value={form.username}
                  onChange={(value) =>
                    setForm((current) =>
                      current ? { ...current, username: value } : current,
                    )
                  }
                />
                <ProfileField
                  label="Region"
                  value={form.region}
                  onChange={(value) =>
                    setForm((current) =>
                      current ? { ...current, region: value } : current,
                    )
                  }
                />
                <ProfileField
                  label="City"
                  value={form.city}
                  onChange={(value) =>
                    setForm((current) =>
                      current ? { ...current, city: value } : current,
                    )
                  }
                />
                <ProfileField
                  label="Gender"
                  value={form.gender}
                  onChange={(value) =>
                    setForm((current) =>
                      current ? { ...current, gender: value } : current,
                    )
                  }
                />
                <ProfileField
                  label="Primary language"
                  value={form.primaryLanguage}
                  onChange={(value) =>
                    setForm((current) =>
                      current ? { ...current, primaryLanguage: value } : current,
                    )
                  }
                />
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Bio
                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, bio: event.target.value } : current,
                    )
                  }
                  rows={4}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <ProfileField
                label="Languages"
                value={form.languages}
                onChange={(value) =>
                  setForm((current) =>
                    current ? { ...current, languages: value } : current,
                  )
                }
              />
              {updateProfile.isError ? (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Could not save profile. Please check the fields and try again.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={updateProfile.isPending}
                  className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {updateProfile.isPending ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setForm(null);
                  }}
                  className="h-11 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="mt-5 text-sm leading-6 text-slate-700">
                {profile.bio || "No bio added yet."}
              </p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-950">Age group</dt>
                  <dd className="mt-1 text-slate-600">
                    {profile.ageGroup || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">Region</dt>
                  <dd className="mt-1 text-slate-600">
                    {profile.region || "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">Languages</dt>
                  <dd className="mt-1 text-slate-600">
                    {profile.languages.length
                      ? profile.languages.join(", ")
                      : "Not set"}
                  </dd>
                </div>
              </dl>
            </>
          )}
          {profileQuery.isError ? (
            <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Could not load `/profiles/me`. Showing session profile data if
              available.
            </p>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}

function ProfileField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-slate-200 px-3 text-sm"
      />
    </label>
  );
}
