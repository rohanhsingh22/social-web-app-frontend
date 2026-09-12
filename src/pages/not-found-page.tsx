import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className="grid min-h-dvh place-items-center bg-background p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Page not found</h1>
          <p className="mt-2 text-sm text-ink-muted">
            The page you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Go to Channels
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
