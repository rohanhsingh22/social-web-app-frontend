import { Sky, Stars } from "@react-three/drei";

// Sky backdrop per world identity (NOT per UI light/dark mode — spec §19).
// Hirotoli Village gets warm physical daytime; the legacy lobby keeps its
// starfield. Single-draw, mobile-safe (no postprocessing).
export function HomeSky({
  light = false,
  village = false,
}: {
  light?: boolean;
  village?: boolean;
}) {
  if (village) {
    return (
      <Sky
        distance={800}
        sunPosition={[60, 35, -80]}
        turbidity={6}
        rayleigh={1.8}
      />
    );
  }
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
