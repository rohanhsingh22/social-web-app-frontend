import { Link, useNavigate } from "react-router-dom";
import { Check, Globe, MessageCircle, PartyPopper, Rocket, Shield, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession, useRefreshSessionMutation } from "@/features/auth/api";

function FeaturePill({ icon: Icon, text }: { icon: typeof MessageCircle; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
      <Icon className="h-4 w-4 text-white/80" aria-hidden />
      <span className="text-sm font-medium text-white/90">{text}</span>
    </div>
  );
}

export function AuthCallbackSuccess() {
  const navigate = useNavigate();
  const authQuery = useAuthSession();
  const profile = authQuery.data?.profile;
  const [refreshSession] = useRefreshSessionMutation();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      await refreshSession();

      if (cancelled) {
        return;
      }

      if (profile && !profile.isComplete) {
        navigate("/onboarding", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    }

    if (authQuery.data) {
      initSession();
    }

    return () => {
      cancelled = true;
    };
  }, [authQuery.data, profile, navigate, refreshSession]);

  useEffect(() => {
    if (authQuery.isLoading || !authQuery.data) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authQuery.isLoading, authQuery.data]);

  const needsOnboarding = profile && !profile.isComplete;

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-hover to-purple-600" />

      {/* Decorative elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-1/3 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 h-36 w-36 rounded-full bg-pink-400/10 blur-3xl" />

      {/* Floating sparkles */}
      <Sparkles className="pointer-events-none absolute left-[15%] top-[20%] h-5 w-5 animate-pulse text-white/25" />
      <Sparkles className="pointer-events-none absolute right-[20%] top-[25%] h-4 w-4 animate-pulse text-white/20" />
      <Sparkles className="pointer-events-none absolute left-[25%] bottom-[30%] h-6 w-6 animate-pulse text-white/20" />
      <Sparkles className="pointer-events-none absolute right-[15%] bottom-[25%] h-4 w-4 animate-pulse text-white/25" />

      {/* Top bar */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Browse Channels</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
            <MessageCircle className="h-5 w-5 text-white" aria-hidden />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">HiiToli</span>
        </div>

        {/* Success card */}
        <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md sm:p-10">
          {/* Success icon with ring */}
          <div className="mx-auto mb-6 relative">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <Check className="h-10 w-10 text-white" strokeWidth={3} aria-hidden />
            </div>
            <div className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-yellow-400 shadow-md">
              <PartyPopper className="h-4 w-4 text-yellow-900" aria-hidden />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {needsOnboarding ? "Almost there!" : "Welcome back!"}
          </h1>

          {/* Subheading */}
          <p className="mt-3 text-base leading-relaxed text-white/75 sm:text-lg">
            {needsOnboarding
              ? "Your account is ready. Let's set up your profile to get started."
              : "Your session is loaded. Redirecting you to the chat."}
          </p>

          {/* Countdown */}
          {authQuery.data && (
            <div className="mt-8">
              <p className="text-sm font-medium text-white/60">Redirecting in</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                {[3, 2, 1].map((num) => (
                  <div
                    key={num}
                    className={`grid h-12 w-12 place-items-center rounded-full text-xl font-bold transition-all duration-300 ${
                      countdown === num
                        ? "bg-white text-brand scale-110 shadow-lg"
                        : countdown < num
                          ? "bg-white/25 text-white/70 scale-95"
                          : "bg-white/10 text-white/40 scale-90"
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {authQuery.isLoading && (
            <div className="mt-8 flex items-center justify-center gap-1.5">
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "0ms" }} />
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "150ms" }} />
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "300ms" }} />
            </div>
          )}

          {/* Error state */}
          {authQuery.isError && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/20 p-4">
              <p className="text-sm font-medium text-white">
                Could not load your session. Please try again.
              </p>
            </div>
          )}

          {/* CTA button */}
          <div className="mt-8">
            <Link
              to={needsOnboarding ? "/onboarding" : "/"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-semibold text-brand shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              {needsOnboarding ? (
                <>
                  <Rocket className="h-5 w-5" />
                  Complete Profile
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Go to Chat
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <FeaturePill icon={MessageCircle} text="Live channels" />
          <FeaturePill icon={Zap} text="Real-time chat" />
          <FeaturePill icon={Shield} text="Safe & secure" />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-white/40">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
