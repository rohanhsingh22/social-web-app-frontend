import {
  ConnectionState,
  Room,
  RoomEvent,
  Track,
  type Participant,
  type TrackPublication,
} from "livekit-client";
import type {
  HomeVoiceConnectionState,
  HomeVoiceEvents,
  VoiceProvider,
} from "./home-voice-provider";

type AudioElement = {
  muted: boolean;
  volume: number;
  remove: () => void;
};

function toConnectionState(state: ConnectionState): HomeVoiceConnectionState {
  switch (state) {
    case ConnectionState.Connected:
      return "connected";
    case ConnectionState.Connecting:
      return "connecting";
    case ConnectionState.Reconnecting:
    case ConnectionState.SignalReconnecting:
      return "reconnecting";
    case ConnectionState.Disconnected:
    default:
      return "disconnected";
  }
}

/**
 * LiveKit-backed VoiceProvider. Owns the Room, remote-audio playback, and
 * event translation. Self mute hits the local mic track (spec #60); the
 * speaker toggle only gates local playback — both stay client-side with no
 * database or membership side effects (spec #61).
 */
export class LivekitVoiceProvider implements VoiceProvider {
  private readonly createRoom: () => Room;
  private room: Room | null = null;
  private audioContainer: HTMLElement | null = null;
  private readonly attachedAudio = new Map<string, AudioElement[]>();
  private microphoneEnabledValue = false;
  private speakerEnabledValue = true;
  private readonly listeners = new Set<HomeVoiceEvents>();

  constructor(createRoom?: () => Room) {
    this.createRoom =
      createRoom ??
      (() =>
        new Room({
          adaptiveStream: true,
          dynacast: true,
          audioCaptureDefaults: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          },
        }));
  }

  get connectionState(): HomeVoiceConnectionState {
    if (!this.room) {
      return "disconnected";
    }

    return toConnectionState(this.room.state);
  }

  get microphoneEnabled(): boolean {
    return this.microphoneEnabledValue;
  }

  get speakerEnabled(): boolean {
    return this.speakerEnabledValue;
  }

  subscribe(events: HomeVoiceEvents): () => void {
    this.listeners.add(events);
    return () => {
      this.listeners.delete(events);
    };
  }

  async connect(input: { serverUrl: string; token: string }): Promise<void> {
    if (this.room) {
      await this.disconnect();
    }

    const room = this.createRoom();
    this.room = room;
    this.emitState("connecting");
    this.ensureAudioContainer();

    room
      .on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        this.emitState(toConnectionState(state));
      })
      .on(RoomEvent.Reconnecting, () => {
        this.emitState("reconnecting");
      })
      .on(RoomEvent.Reconnected, () => {
        this.emitState("connected");
      })
      .on(RoomEvent.Disconnected, () => {
        this.emitState("disconnected");
      })
      .on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        this.emitSpeakers(speakers.map((speaker) => speaker.identity));
      })
      .on(
        RoomEvent.TrackSubscribed,
        (
          track: Track,
          _publication: TrackPublication,
          participant: Participant,
        ) => {
          this.attachRemoteAudio(track, participant);
        },
      )
      .on(RoomEvent.TrackUnsubscribed, (track: Track) => {
        this.detachAudio(track);
      });

    try {
      await room.connect(input.serverUrl, input.token, {
        autoSubscribe: true,
      });
    } catch {
      this.room = null;
      this.emitState("disconnected");
      this.emitError("VOICE_CONNECT_FAILED");
      throw new Error("VOICE_CONNECT_FAILED");
    }

    this.emitState(toConnectionState(room.state));

    try {
      await room.startAudio();
    } catch {
      this.emitError("AUDIO_PLAYBACK_BLOCKED");
    }
  }

  async disconnect(): Promise<void> {
    const room = this.room;
    this.room = null;
    this.attachedAudio.clear();
    this.audioContainer?.remove();
    this.audioContainer = null;

    if (room) {
      room.removeAllListeners();
      await room.disconnect();
    }

    this.emitState("disconnected");
    this.emitSpeakers([]);
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (!this.room) {
      this.microphoneEnabledValue = enabled;
      return;
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
      this.microphoneEnabledValue = enabled;
    } catch {
      this.emitError("MICROPHONE_BLOCKED");
      throw new Error("MICROPHONE_BLOCKED");
    }
  }

  setSpeakerEnabled(enabled: boolean): void {
    this.speakerEnabledValue = enabled;

    for (const elements of this.attachedAudio.values()) {
      for (const element of elements) {
        element.muted = !enabled;
      }
    }

    if (enabled) {
      void this.room?.startAudio().catch(() => {
        this.emitError("AUDIO_PLAYBACK_BLOCKED");
      });
    }
  }

  private ensureAudioContainer(): void {
    if (this.audioContainer || typeof document === "undefined") {
      return;
    }

    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    container.style.display = "none";
    document.body.appendChild(container);
    this.audioContainer = container;
  }

  private attachRemoteAudio(track: Track, participant: Participant): void {
    if (track.kind !== Track.Kind.Audio || participant.isLocal) {
      return;
    }

    const attached = track.attach();
    const elements = (Array.isArray(attached) ? attached : [attached]).map(
      (element) => {
        const audio = element as unknown as AudioElement;
        audio.muted = !this.speakerEnabledValue;
        this.audioContainer?.appendChild(element);
        return audio;
      },
    );
    const key = track.sid ?? `${participant.identity}-audio`;
    const existing = this.attachedAudio.get(key) ?? [];
    this.attachedAudio.set(key, [...existing, ...elements]);
  }

  private detachAudio(track: Track): void {
    const key = track.sid ?? "";
    const elements = this.attachedAudio.get(key);
    this.attachedAudio.delete(key);

    for (const element of elements ?? []) {
      element.remove();
    }
  }

  private emitState(state: HomeVoiceConnectionState): void {
    for (const listener of this.listeners) {
      listener.onConnectionState?.(state);
    }
  }

  private emitSpeakers(identities: string[]): void {
    for (const listener of this.listeners) {
      listener.onSpeakersChanged?.(identities);
    }
  }

  private emitError(code: string): void {
    for (const listener of this.listeners) {
      listener.onError?.(code);
    }
  }
}
