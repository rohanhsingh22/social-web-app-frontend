import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import type { HomeWorldTheme } from "./home-world-types";
import { HomePodium } from "./HomePodium";
import { HomeLobbySet } from "./HomeLobbySet";
import { HomeVillageSet } from "./HomeVillageSet";

// Set true when final environment GLBs land under public/hirotoli/home/.
// Until then village geometry is fully procedural (no network fetch).
const FINAL_ENV_MODELS_AVAILABLE = false;

function EnvironmentModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} dispose={null} />;
}

function isLoadableModel(url: string | undefined): url is string {
  if (!url) {
    return false;
  }
  // Only real fetchable model files reach the GLB loader — symbolic
  // scheme URLs (event://…) resolve to procedural props elsewhere.
  if (!url.endsWith(".glb") && !url.endsWith(".gltf")) {
    return false;
  }
  // Manifest refs under /hirotoli/ resolve procedurally until the final
  // Quaternius GLBs are committed (Phase 1 approval) — never fetch a URL
  // that cannot exist yet. Flip with the binaries, no other change needed.
  if (url.startsWith("/hirotoli/") && !FINAL_ENV_MODELS_AVAILABLE) {
    return false;
  }
  return true;
}

/** Rollback gate: the legacy lobby renders ONLY for the legacy theme id. */
export function isLegacyWorld(theme: HomeWorldTheme): boolean {
  return theme.id === "hirotoli-home-default";
}

// Environment: sky/background + real 3D world geometry + ground, all from
// theme — the same idea as character GLBs. hirotoli-village renders the
// procedural village set (GLB environmentModel overrides when final assets
// land); the legacy podium-lobby survives solely for rollback.
export function HomeEnvironment({
  theme,
  accentColor,
  reducedMotion = false,
}: {
  theme: HomeWorldTheme;
  accentColor: string;
  reducedMotion?: boolean;
}) {
  const bg = theme.environment.background?.url;
  const bgColor =
    typeof bg === "string" && bg.startsWith("color:") ? bg.slice(6) : null;
  const modelUrl = theme.environment.environmentModel?.url;
  // Light twin shares all geometry — palette flips via the theme id.
  const light = theme.id.includes("light");
  const legacy = isLegacyWorld(theme);

  return (
    <>
      {bgColor && <color attach="background" args={[bgColor]} />}
      {legacy ? (
        <>
          <HomePodium theme={theme} accentColor={accentColor} />
          <HomeLobbySet
            accentColor={accentColor}
            reducedMotion={reducedMotion}
            light={light}
          />
        </>
      ) : (
        <HomeVillageSet />
      )}
      {isLoadableModel(modelUrl) && (
        <Suspense fallback={null}>
          <EnvironmentModel url={modelUrl} />
        </Suspense>
      )}
    </>
  );
}
