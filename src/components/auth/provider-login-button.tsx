"use client";

import { Facebook, Globe, Linkedin } from "lucide-react";
import { config } from "@/lib/config";
import type { AuthProviderInfo } from "@/rtk/auth/auth-api";

const providerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  google: Globe,
  linkedin: Linkedin,
};

const providerStyles: Record<string, string> = {
  facebook:
    "bg-[#1877f2] hover:bg-[#0d5dc8] text-white",
  google:
    "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  linkedin:
    "bg-[#0a66c2] hover:bg-[#084d93] text-white",
};

export function ProviderLoginButton({
  provider,
}: {
  provider: AuthProviderInfo;
}) {
  const Icon = providerIcons[provider.id] ?? Globe;
  const styles = providerStyles[provider.id] ?? "bg-gray-600 hover:bg-gray-700 text-white";

  function startLogin() {
    window.location.href = `${config.apiBaseUrl}/auth/${provider.id}`;
  }

  return (
    <button
      type="button"
      onClick={startLogin}
      className={`inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg px-4 text-sm font-semibold shadow-sm transition-[transform,box-shadow,background-color] duration-150 ease-out hover:shadow-md active:scale-[0.97] ${styles}`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      Continue with {provider.displayName}
    </button>
  );
}
