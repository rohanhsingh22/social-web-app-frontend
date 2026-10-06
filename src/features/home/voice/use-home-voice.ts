import { useCallback, useEffect, useRef, useState } from "react";
import { useHomeVoiceTokenMutation } from "@/features/home/api";
import { getHomeErrorCode } from "@/features/home/use-home-actions";
import { LivekitVoiceProvider } from "./livekit-home-voice-provider";
import {
  MAX_VOICE_REJOIN_ATTEMPTS,
  reconnectDelay,
  shouldAutoRejoin,
} from "./voice-reconnect";
import type {
  HomeVoiceConnectionState,
  VoiceProvider,
} from "./home-voice-provider";

// Voice session state (spec #96, #98). Owns connection/mute/speaker/speakers
// only — never HomeMembership, invitations, or join requests. Reconnects and
// token refreshes never touch membership (backend spec #56-58).
export function useHomeVoice(input: {
  homeId: string | null;
  autoConnect?: boolean;
  provider?: VoiceProvider;
}) {
  const { homeId, autoConnect = true, provider: injected } = input;
  const providerRef = useRef<VoiceProvider | null>(null);
  if (!providerRef.current) {
    providerRef.current = injected ?? new LivekitVoiceProvider();
  }

  const [getToken] = useHomeVoiceTokenMutation();
  const [connectionState, setConnectionState] =
    useState<HomeVoiceConnectionState>("disconnected");
  // Join muted: no surprise hot mic; one tap to speak.
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [speakingIds, setSpeakingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // True while a rejoin backoff timer is armed. Kept separate from
  // connectionState on purpose: flipping connectionState inside the retry
  // effect would re-trigger its own cleanup and cancel the timer.
  const [rejoining, setRejoining] = useState(false);
  const stateRef = useRef(connectionState);
  const mutedRef = useRef(isMuted);
  const homeIdRef = useRef(homeId);
  // Set for user-initiated disconnects (leave, unmount, homeless) so only
  // UNEXPECTED drops auto-rejoin. Attempt budget resets on every connect.
  const intentionalRef = useRef(false);
  const attemptsRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = connectionState;
  }, [connectionState]);

  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    homeIdRef.current = homeId;
  }, [homeId]);

  useEffect(() => {
    const provider = providerRef.current;
    if (!provider) {
      return;
    }

    return provider.subscribe({
      onConnectionState: (next) => {
        setConnectionState(next);
        if (next === "connected") {
          attemptsRef.current = 0;
          setRejoining(false);
          setError(null);
        }
      },
      onSpeakersChanged: (identities) => setSpeakingIds(identities),
      onError: (code) => setError(code),
    });
  }, []);

  const connectInternal = useCallback(
    async (resetAttempts: boolean) => {
      const provider = providerRef.current;
      if (
        !provider ||
        stateRef.current === "connected" ||
        stateRef.current === "connecting"
      ) {
        return;
      }

      intentionalRef.current = false;
      if (resetAttempts) {
        attemptsRef.current = 0;
      }
      setRejoining(false);
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      setError(null);
      setConnectionState("connecting");

      let credentials: { token: string; serverUrl: string };
      try {
        const result = await getToken(undefined).unwrap();
        if (!result.token || !result.serverUrl) {
          throw new Error("VOICE_UNAVAILABLE");
        }
        credentials = { token: result.token, serverUrl: result.serverUrl };
      } catch (requestError) {
        const code = getHomeErrorCode(requestError) ?? "VOICE_UNAVAILABLE";
        // Missing server configuration never self-heals mid-session — don't
        // burn the rejoin budget on it. Manual Retry still works after the
        // server is provisioned and restarted.
        if (code === "VOICE_UNAVAILABLE") {
          intentionalRef.current = true;
        }
        setConnectionState("disconnected");
        setError(code);
        return;
      }

      try {
        await provider.connect(credentials);
        await provider.setMicrophoneEnabled(!mutedRef.current);
        provider.setSpeakerEnabled(true);
        setIsSpeakerEnabled(true);
      } catch (connectError) {
        setConnectionState("disconnected");
        setError(getHomeErrorCode(connectError) ?? "VOICE_CONNECT_FAILED");
      }
    },
    [getToken],
  );

  const connect = useCallback(() => {
    void connectInternal(true);
  }, [connectInternal]);

  const disconnect = useCallback(async () => {
    intentionalRef.current = true;
    setRejoining(false);
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    await providerRef.current?.disconnect().catch(() => undefined);
    setSpeakingIds([]);
  }, []);

  // Unexpected drops (WiFi loss beyond the SDK retry, expired tokens, tab
  // sleep kills) rejoin with a FRESH token on backoff. Membership is never
  // touched — when the Home is gone, homeId is null and this stays quiet.
  useEffect(() => {
    if (
      !shouldAutoRejoin({
        autoConnect,
        homeId: homeIdRef.current,
        connectionState,
        intentional: intentionalRef.current,
        attempts: attemptsRef.current,
      })
    ) {
      if (
        connectionState === "disconnected" &&
        attemptsRef.current >= MAX_VOICE_REJOIN_ATTEMPTS
      ) {
        setRejoining(false);
        setError((current) => current ?? "VOICE_RECONNECT_FAILED");
      }
      return;
    }

    attemptsRef.current += 1;
    setRejoining(true);
    retryTimerRef.current = window.setTimeout(
      () => {
        retryTimerRef.current = null;
        void providerRef.current
          ?.disconnect()
          .catch(() => undefined)
          .then(() => {
            // Fresh token path: reset the in-flight guard and reconnect
            // WITHOUT resetting the attempt budget.
            stateRef.current = "disconnected";
            void connectInternal(false);
          });
      },
      reconnectDelay(attemptsRef.current),
    );

    return () => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      setRejoining(false);
    };
  }, [connectionState, autoConnect, connectInternal]);

  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    if (homeId) {
      void connect();
    } else {
      void disconnect();
    }
  }, [homeId, autoConnect, connect, disconnect]);

  useEffect(() => {
    const provider = providerRef.current;
    return () => {
      intentionalRef.current = true;
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      void provider?.disconnect().catch(() => undefined);
    };
  }, []);

  const toggleMute = useCallback(async () => {
    const provider = providerRef.current;
    if (!provider) {
      return;
    }

    const nextMuted = !mutedRef.current;
    try {
      await provider.setMicrophoneEnabled(!nextMuted);
      setIsMuted(nextMuted);
    } catch {
      setError("MICROPHONE_BLOCKED");
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    const provider = providerRef.current;
    if (!provider) {
      return;
    }

    const nextEnabled = !provider.speakerEnabled;
    provider.setSpeakerEnabled(nextEnabled);
    setIsSpeakerEnabled(nextEnabled);
  }, []);

  return {
    connectionState,
    rejoining,
    isMuted,
    isSpeakerEnabled,
    speakingIds,
    error,
    connect: () => void connect(),
    disconnect: () => void disconnect(),
    retry: () => void connect(),
    toggleMute: () => void toggleMute(),
    toggleSpeaker,
    clearError: () => setError(null),
  };
}
