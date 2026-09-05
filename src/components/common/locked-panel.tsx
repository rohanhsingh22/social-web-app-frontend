import { LockKeyhole } from "lucide-react";
import { FacebookLoginButton } from "@/components/auth/facebook-login-button";

export function LockedPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="grid min-h-dvh place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <LockKeyhole className="mb-4 h-9 w-9 text-slate-500" aria-hidden />
        <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-5">
          <FacebookLoginButton />
        </div>
      </div>
    </section>
  );
}
