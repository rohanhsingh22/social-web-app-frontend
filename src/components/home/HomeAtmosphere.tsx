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
  // Every particle entry renders (kinds: sparkles, pollen-drift, snow, …).
  // Mobile + reduced-motion: fewer/frozen particles (spec §18).
  const particles = theme.atmosphere.particles ?? [];
  const scaled = (count: number) => (compact ? Math.min(count, 30) : count);
  const shadows = theme.atmosphere.effects?.some(
    (e) => e.kind === "contact-shadows" && e.enabled !== false,
  );

  return (
    <>
      {fog && <fog attach="fog" args={[fog.color ?? "#0a0b10", fog.near ?? 4, fog.far ?? 12]} />}
      {!reducedMotion &&
        particles.map((p, i) => (
          <Sparkles
            key={`${p.kind}-${i}`}
            count={scaled(p.count ?? 40)}
            scale={10}
            size={p.size ?? 2}
            speed={p.speed ?? 0.4}
            opacity={p.opacity ?? 0.5}
            color={p.color === "accent" ? accentColor : (p.color ?? accentColor)}
          />
        ))}
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
