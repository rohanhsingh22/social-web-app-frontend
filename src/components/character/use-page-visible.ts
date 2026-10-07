import { useEffect, useState } from "react";

// Page visibility hook (Phase 4, task 6).
// The animation controller pauses frame work while the tab is hidden so Home
// burns no CPU/GPU in the background and resumes cleanly on return.
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(
    () =>
      typeof document === "undefined" ||
      document.visibilityState !== "hidden",
  );

  useEffect(() => {
    const onChange = () => {
      setVisible(document.visibilityState !== "hidden");
    };
    document.addEventListener("visibilitychange", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
    };
  }, []);

  return visible;
}
