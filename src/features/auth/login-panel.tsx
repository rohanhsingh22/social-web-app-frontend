import { FacebookLoginButton } from "@/components/auth/facebook-login-button";

export function LoginPanel() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          V1 uses Facebook Authentication only. The backend handles OAuth and
          redirects back after creating your app session.
        </p>
        <div className="mt-5">
          <FacebookLoginButton />
        </div>
      </section>
    </main>
  );
}
