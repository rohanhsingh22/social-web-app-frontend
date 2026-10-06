import { useProgress } from "@react-three/drei";

// Loading overlay for the Home stage (spec #111): never a blank screen
// while GLBs stream in. Rendered as DOM over the Canvas.
export function HomeCharacterLoading() {
  const { active, progress } = useProgress();

  if (!active) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Loading characters"
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface/90 px-6 py-5 backdrop-blur">
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-16 w-10 animate-pulse rounded-xl bg-surface-muted"
            />
          ))}
        </div>
        <p className="text-xs font-medium text-ink-subtle">
          Loading characters… {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
