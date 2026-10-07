import { ContactShadows, Sparkles } from "@react-three/drei";
import type { HomeWorldTheme } from "./home-world-types";

// Atmosphere: fog + particles + effects from theme. Reduced-motion and
// mobile perf stay owned by callers (dpr / particle count) — theme only
// describes intent.
export function HomeAtmosphere({
  theme,
  accentColor,
  reducedMotion = false,
  compact = false,
}: {
  theme: HomeWorldTheme;
  accentColor: string;
  reducedMotion?: boolean;
  compact?: boolean;
}) {
  const fog = theme.atmosphere.fog;
  const sparkles = theme.atmosphere.particles?.find(
    (p) => p.kind === "sparkles",
  );
  // Mobile + reduced-motion: fewer/frozen particles (spec §18).
  const count = sparkles?.count ?? 60;
  const scaledCount = compact ? Math.min(count, 30) : count;
  const shadows = theme.atmosphere.effects?.some(
    (e) => e.kind === "contact-shadows" && e.enabled !== false,
  );

  return (
    <>
      {fog && <fog attach="fog" args={[fog.color ?? "#0a0b10", fog.near ?? 4, fog.far ?? 12]} />}
      {sparkles && !reducedMotion && (
        <Sparkles
          count={scaledCount}
          scale={10}
          size={sparkles.size ?? 2}
          speed={sparkles.speed ?? 0.4}
          opacity={sparkles.opacity ?? 0.5}
          color={sparkles.color === "accent" ? accentColor : (sparkles.color ?? accentColor)}
        />
      )}
      {shadows !== false && (
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={10}
          blur={2.5}
          opacity={0.55}
          far={4}
          color="#000000"
        />
      )}
    </>
  );
}
