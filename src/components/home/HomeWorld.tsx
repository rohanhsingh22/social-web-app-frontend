import type { ReactNode } from "react";
import type { HomeWorldTheme } from "./home-world-types";
import { HomeEnvironment } from "./HomeEnvironment";
import { HomeLighting } from "./HomeLighting";
import { HomeAtmosphere } from "./HomeAtmosphere";
import { HomeDecorations } from "./HomeDecorations";
import { HomeSky } from "./HomeSky";

// HomeWorld (spec §14): theme-driven world frame around CharacterStage.
// Keeps greeting/CTAs/navigation as HTML outside the Canvas — this owns
// only environment + lighting + atmosphere + decorations + stage.
export function HomeWorld({
  theme,
  accentColor = "#ff2e63",
  reducedMotion = false,
  compact = false,
  children,
}: {
  theme: HomeWorldTheme;
  accentColor?: string;
  reducedMotion?: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  // Light twin shares all geometry — palette flips via the theme id.
  const light = theme.id.includes("light");
  return (
    <>
      <HomeSky light={light} />
      <HomeEnvironment
        theme={theme}
        accentColor={accentColor}
        reducedMotion={reducedMotion}
      />
      <HomeLighting theme={theme} />
      <HomeAtmosphere
        theme={theme}
        accentColor={accentColor}
        reducedMotion={reducedMotion}
        compact={compact}
      />
      <HomeDecorations theme={theme} />
      <group
        position={theme.characterStage.position}
        rotation={theme.characterStage.rotation}
        scale={[theme.characterStage.scale, theme.characterStage.scale, theme.characterStage.scale]}
      >
        {children}
      </group>
    </>
  );
}
