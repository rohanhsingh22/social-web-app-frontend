import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

// Dev-only perf probe (spec §18): logs draw calls, geometries, textures,
// and fps to the console every 5s so regressions get measured on real
// hardware. Never ships to production (import.meta.env.DEV gate at call
// site — this component itself renders nothing).
export function HomePerfProbe() {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  const last = useRef(performance.now());

  useFrame(() => {
    frames.current += 1;
    const now = performance.now();
    if (now - last.current >= 5000) {
      const info = gl.info;
      console.debug(
        `[home-perf] fps=${Math.round((frames.current * 1000) / (now - last.current))} ` +
          `draws=${info.render.calls} tris=${info.render.triangles} ` +
          `geoms=${info.memory.geometries} tex=${info.memory.textures}`,
      );
      frames.current = 0;
      last.current = now;
    }
  });

  return null;
}
