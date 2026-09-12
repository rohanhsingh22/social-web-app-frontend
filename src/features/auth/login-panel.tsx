import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, MessageCircle, Moon, Sun, Users, Zap } from "lucide-react";
import { ProviderLoginButton } from "@/components/auth/provider-login-button";
import { useAuthProvidersQuery, useAuthSession } from "@/rtk/auth/auth-api";
import { useThemeMode } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

function FeatureItem({ icon: Icon, text }: { icon: typeof MessageCircle; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center overflow-hidden bg-gradient-to-br from-brand via-brand-hover to-purple-600 p-12 text-on-brand">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-1/3 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

      <div className="relative z-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
            <MessageCircle className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">HiiToli</h1>
        </div>

        <h2 className="mb-4 text-4xl font-bold leading-tight">
          Connect.<br />
          Chat.<br />
          Belong.
        </h2>

        <p className="mb-10 max-w-sm text-base leading-relaxed opacity-90">
          Join live public channels, build connections, and enjoy private conversations with people around the world.
        </p>

        <div className="space-y-4">
          <FeatureItem icon={MessageCircle} text="Live public channels" />
          <FeatureItem icon={Users} text="Build meaningful connections" />
          <FeatureItem icon={Zap} text="Real-time private chat" />
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { data: providers = [] } = useAuthProvidersQuery();

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        Sign in to join the conversation and catch up with your community.
      </p>

      <div className="mt-8 space-y-3">
        {providers.map((provider) => (
          <ProviderLoginButton key={provider.id} provider={provider} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-subtle">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

export function LoginPanel() {
  const navigate = useNavigate();
  const authQuery = useAuthSession();
  const { mode, setMode } = useThemeMode();

  useEffect(() => {
    if (authQuery.data) {
      navigate("/", { replace: true });
    }
  }, [authQuery.data, navigate]);

  if (authQuery.isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh">
      {/* Full-screen brand background */}
      <BrandPanel />

      {/* Top bar with theme toggle and browse button */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          className="bg-surface/80 backdrop-blur-sm"
          aria-label="Toggle theme"
        >
          {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2 bg-surface/80 backdrop-blur-sm"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Browse Channels</span>
        </Button>
      </div>

      {/* Login form overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm lg:justify-end lg:bg-transparent lg:backdrop-blur-none">
        <div className="mx-4 w-full max-w-md rounded-2xl border border-line bg-surface/95 p-8 shadow-2xl backdrop-blur-md lg:mr-16 lg:p-10">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
