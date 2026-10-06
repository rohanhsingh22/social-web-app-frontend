import { createContext, useContext } from "react";
import type { useHomeVoice } from "./use-home-voice";

export type HomeVoiceContextValue = ReturnType<typeof useHomeVoice>;

export const HomeVoiceContext =
  createContext<HomeVoiceContextValue | null>(null);

export function useHomeVoiceContext(): HomeVoiceContextValue {
  const value = useContext(HomeVoiceContext);

  if (!value) {
    throw new Error(
      "useHomeVoiceContext must be used inside HomeVoiceProvider",
    );
  }

  return value;
}
