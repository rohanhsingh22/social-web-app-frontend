import { Suspense, lazy } from "react";
import type { HomeWorldTheme } from "./home-world-types";

const HomeEventProps = lazy(() =>
  import("./HomeEventProps").then((m) => ({ default: m.HomeEventProps })),
);

// Decorations/props layer (spec §12). Empty at launch — event props arrive
// as theme decorations without touching HomeWorld or the renderer.
// Never obscures navigation: 3D props stay inside the Canvas. Nonessential
// props lazy-load behind Suspense (spec §18).
export function HomeDecorations({ theme }: { theme: HomeWorldTheme }) {
  if (!theme.decorations || theme.decorations.length === 0) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <HomeEventProps decorations={theme.decorations} />
    </Suspense>
  );
}
