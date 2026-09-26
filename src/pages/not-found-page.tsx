import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className="grid min-h-dvh place-items-center bg-background p-6 text-center">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-surface-muted text-ink-subtle">
            <FileQuestion className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="page-header-title mt-4">Page not found</h1>
          <p className="page-header-subtitle mt-2">
            The page you are looking for does not exist. Check the address or
            return home.
          </p>
          <Link
            to="/home"
            className="mt-4 inline-block text-sm font-semibold text-brand-ink hover:underline"
          >
            Return home
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
