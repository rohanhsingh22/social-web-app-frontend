import { describe, expect, it, vi } from "vitest";
import { ConnectionState, RoomEvent, Track } from "livekit-client";
import { LivekitVoiceProvider } from "./livekit-home-voice-provider";

function fakeAudioElement() {
  return { muted: false, volume: 1, remove: vi.fn() };
}

function fakeAudioTrack(sid = "sid-1") {
  const element = fakeAudioElement();
  return {
    element,
    track: {
      kind: Track.Kind.Audio,
      sid,
      attach: vi.fn(() => element),
    },
  };
}

// Minimal Room double: only the surface the provider touches.
class FakeRoom {
  state = ConnectionState.Disconnected;
  private readonly handlers = new Map<
    string,
    Array<(...args: unknown[]) => void>
  >();
  readonly localParticipant = {
    setMicrophoneEnabled: vi.fn(async () => {}),
  };
  readonly connect = vi.fn(async () => {
    this.state = ConnectionState.Connected;
  });
  readonly disconnect = vi.fn(async () => {
    this.state = ConnectionState.Disconnected;
  });
  readonly startAudio = vi.fn(async () => true);
  readonly removeAllListeners = vi.fn();

  on(event: string, callback: (...args: unknown[]) => void) {
    const list = this.handlers.get(event) ?? [];
    list.push(callback);
    this.handlers.set(event, list);
    return this;
  }

  emit(event: string, ...args: unknown[]) {
    for (const callback of this.handlers.get(event) ?? []) {
      callback(...args);
    }
  }
}

function remoteParticipant(identity: string, isLocal = false) {
  return { identity, isLocal };
}

describe("LivekitVoiceProvider", () => {
  it("connects with auto-subscribe and reports state", async () => {
    const room = new FakeRoom();
    const provider = new LivekitVoiceProvider(
      () => room as never,
    );
    const states: string[] = [];
    provider.subscribe({ onConnectionState: (state) => states.push(state) });

    await provider.connect({ serverUrl: "wss://livekit.example", token: "jwt" });

    expect(room.connect).toHaveBeenCalledWith(
      "wss://livekit.example",
      "jwt",
      { autoSubscribe: true },
    );
    expect(states).toContain("connecting");
    expect(states).toContain("connected");
    expect(provider.connectionState).toBe("connected");
  });

  it("reports connect failures without hanging", async () => {
    const room = new FakeRoom();
    room.connect.mockRejectedValueOnce(new Error("denied"));
    const provider = new LivekitVoiceProvider(() => room as never);
    const errors: string[] = [];
    provider.subscribe({ onError: (code) => errors.push(code) });

    await expect(
      provider.connect({ serverUrl: "wss://x", token: "jwt" }),
    ).rejects.toThrow("VOICE_CONNECT_FAILED");
    expect(errors).toContain("VOICE_CONNECT_FAILED");
  });

  it("toggles the local microphone", async () => {
    const room = new FakeRoom();
    const provider = new LivekitVoiceProvider(() => room as never);
    await provider.connect({ serverUrl: "wss://x", token: "jwt" });

    await provider.setMicrophoneEnabled(false);

    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenCalledWith(
      false,
    );
  });

  it("maps microphone denial to an error code", async () => {
    const room = new FakeRoom();
    room.localParticipant.setMicrophoneEnabled.mockRejectedValueOnce(
      new Error("denied"),
    );
    const provider = new LivekitVoiceProvider(() => room as never);
    const errors: string[] = [];
    provider.subscribe({ onError: (code) => errors.push(code) });
    await provider.connect({ serverUrl: "wss://x", token: "jwt" });

    await expect(provider.setMicrophoneEnabled(true)).rejects.toThrow(
      "MICROPHONE_BLOCKED",
    );
    expect(errors).toContain("MICROPHONE_BLOCKED");
  });

  it("plays remote audio and gates it with the speaker toggle", async () => {
    const room = new FakeRoom();
    const provider = new LivekitVoiceProvider(() => room as never);
    await provider.connect({ serverUrl: "wss://x", token: "jwt" });

    const { track, element } = fakeAudioTrack();
    room.emit(
      RoomEvent.TrackSubscribed,
      track as never,
      {} as never,
      remoteParticipant("user-2") as never,
    );

    expect(track.attach).toHaveBeenCalled();
    expect(element.muted).toBe(false);

    provider.setSpeakerEnabled(false);
    expect(element.muted).toBe(true);

    provider.setSpeakerEnabled(true);
    expect(element.muted).toBe(false);
  });

  it("never plays the local microphone back", async () => {
    const room = new FakeRoom();
    const provider = new LivekitVoiceProvider(() => room as never);
    await provider.connect({ serverUrl: "wss://x", token: "jwt" });

    const { track } = fakeAudioTrack();
    room.emit(
      RoomEvent.TrackSubscribed,
      track as never,
      {} as never,
      remoteParticipant("me", true) as never,
    );

    expect(track.attach).not.toHaveBeenCalled();
  });

  it("translates active speakers to identities", async () => {
    const room = new FakeRoom();
    const provider = new LivekitVoiceProvider(() => room as never);
    const seen: string[][] = [];
    provider.subscribe({
      onSpeakersChanged: (identities) => seen.push(identities),
    });
    await provider.connect({ serverUrl: "wss://x", token: "jwt" });

    room.emit(
      RoomEvent.ActiveSpeakersChanged,
      [remoteParticipant("user-2"), remoteParticipant("user-3")] as never,
    );

    expect(seen).toContainEqual(["user-2", "user-3"]);
  });

  it("translates reconnecting connection states", async () => {
    const room = new FakeRoom();
    const provider = new LivekitVoiceProvider(() => room as never);
    const states: string[] = [];
    provider.subscribe({ onConnectionState: (state) => states.push(state) });
    await provider.connect({ serverUrl: "wss://x", token: "jwt" });

    room.emit(RoomEvent.ConnectionStateChanged, ConnectionState.Reconnecting);

    expect(states).toContain("reconnecting");
  });

  it("disconnects cleanly", async () => {
    const room = new FakeRoom();
    const provider = new LivekitVoiceProvider(() => room as never);
    await provider.connect({ serverUrl: "wss://x", token: "jwt" });

    await provider.disconnect();

    expect(room.disconnect).toHaveBeenCalled();
    expect(provider.connectionState).toBe("disconnected");
  });
});
