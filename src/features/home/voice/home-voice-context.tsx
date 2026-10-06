import type { ReactNode } from "react";
import { useHomeVoice } from "./use-home-voice";
import { HomeVoiceContext } from "./use-home-voice-context";
import type { VoiceProvider } from "./home-voice-provider";

// Voice session scope for the Home stage (spec #62, #96). Mounted around the
// stage + controls only — never at the app root — so voice connects solely
// from an active Home.
export function HomeVoiceProvider({
  homeId,
  children,
  provider,
}: {
  homeId: string;
  children: ReactNode;
  provider?: VoiceProvider;
}) {
  const voice = useHomeVoice({ homeId, autoConnect: true, provider });

  return (
    <HomeVoiceContext.Provider value={voice}>
      {children}
    </HomeVoiceContext.Provider>
  );
}
