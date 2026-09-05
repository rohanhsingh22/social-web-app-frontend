"use client";

import { Facebook } from "lucide-react";
import { config } from "@/lib/config";

export function FacebookLoginButton({
  label = "Continue with Facebook",
}: {
  label?: string;
}) {
  function startLogin() {
    window.location.href = `${config.apiBaseUrl}/auth/facebook`;
  }

  return (
    <button
      type="button"
      onClick={startLogin}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1877f2] px-4 text-sm font-semibold text-white transition hover:bg-[#0d5dc8]"
    >
      <Facebook className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );
}
