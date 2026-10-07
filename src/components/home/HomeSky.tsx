import { Sky, Stars } from "@react-three/drei";

// Full-screen sky backdrop (world v2.1): the whole screen is the theme.
// Dark mode gets a starfield over the theme background; light mode gets a
// physical sky. Both are single-draw, mobile-safe (no postprocessing).
export function HomeSky({ light = false }: { light?: boolean }) {
  if (light) {
    return (
      // distance stays inside the default camera far plane so the sky
      // dome is never clipped, while still surrounding the whole set.
      <Sky
        distance={800}
        sunPosition={[60, 25, -80]}
        turbidity={8}
        rayleigh={2.5}
      />
    );
  }
  return (
    <Stars
      radius={80}
      depth={30}
      count={2200}
      factor={3.5}
      saturation={0}
      fade
      speed={0.4}
    />
  );
}
