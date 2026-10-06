// Voice provider abstraction (spec #23, frontend #62). The character
// renderer and Home state never touch the LiveKit SDK — everything voice
// flows through this interface, so a future SFU swap stays local.

export type HomeVoiceConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export type HomeVoiceEvents = {
  onConnectionState?: (state: HomeVoiceConnectionState) => void;
  onSpeakersChanged?: (identities: string[]) => void;
  onError?: (code: string) => void;
};

export interface VoiceProvider {
  readonly connectionState: HomeVoiceConnectionState;
  readonly microphoneEnabled: boolean;
  readonly speakerEnabled: boolean;
  connect(input: { serverUrl: string; token: string }): Promise<void>;
  disconnect(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  setSpeakerEnabled(enabled: boolean): void;
  subscribe(events: HomeVoiceEvents): () => void;
}
