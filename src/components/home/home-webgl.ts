// WebGL capability probe. R3F context-creation failures don't reliably
// propagate to React error boundaries, so the Home stage checks upfront and
// renders the static fallback directly (same member order, no 3D).
export function isWebGLSupported(): boolean {
  if (typeof document === "undefined") {
    return true;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}
