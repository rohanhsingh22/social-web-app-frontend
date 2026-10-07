import type { HomeWorldTheme } from "./home-world-types";

// Lighting driven entirely by theme (spec §13). Defaults mirror the
// current stage: soft ambient + warm key with shadow + cool fill.
export function HomeLighting({ theme }: { theme: HomeWorldTheme }) {
  const dir = theme.lighting.directional;
  const light = theme.id.includes("light");
  return (
    <>
      <ambientLight
        intensity={theme.lighting.ambient.intensity ?? 0.65}
        color={theme.lighting.ambient.color ?? "#ffffff"}
      />
      {/* Soft sky/ground fill so structures read in both modes */}
      <hemisphereLight
        args={light ? ["#ffffff", "#b9c4da", 0.6] : ["#8ea2ff", "#1a1c2e", 0.5]}
      />
      <directionalLight
        position={dir?.position ?? [4, 8, 5]}
        intensity={dir?.intensity ?? 1.6}
        color={dir?.color ?? "#ffffff"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 5, -3]} intensity={0.5} />
      {/* Cool back-rim so pillars/walls separate from the backdrop */}
      <directionalLight
        position={[0, 5, -6]}
        intensity={light ? 0.5 : 0.9}
        color={light ? "#93c5fd" : "#7dd3fc"}
      />
      {theme.lighting.pointLights?.map((light, i) => (
        <pointLight
          key={i}
          position={light.position ?? [0, 2, 0]}
          intensity={light.intensity ?? 1}
          color={light.color ?? "#ffffff"}
        />
      ))}
    </>
  );
}
