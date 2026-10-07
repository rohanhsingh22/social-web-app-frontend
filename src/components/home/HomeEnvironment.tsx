import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import type { HomeWorldTheme } from "./home-world-types";
import { HomePodium } from "./HomePodium";
import { HomeLobbySet } from "./HomeLobbySet";

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
  return url.endsWith(".glb") || url.endsWith(".gltf");
}

// Environment: sky/background + real 3D world geometry + ground, all from
// theme — the same idea as character GLBs. When the theme carries an
// environmentModel URL it loads like any character model (useGLTF +
// Suspense, cached by URL so only the active world ever downloads).
// Otherwise the built-in procedural podium-lobby set renders.
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

  return (
    <>
      {bgColor && <color attach="background" args={[bgColor]} />}
      <HomePodium theme={theme} accentColor={accentColor} />
      <HomeLobbySet
        accentColor={accentColor}
        reducedMotion={reducedMotion}
        light={light}
      />
      {isLoadableModel(modelUrl) && (
        <Suspense fallback={null}>
          <EnvironmentModel url={modelUrl} />
        </Suspense>
      )}
    </>
  );
}
