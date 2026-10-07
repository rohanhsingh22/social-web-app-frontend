import { useRef, useState } from "react";
import type { HomeWorldTheme } from "./home-world-types";

// Ambient audio hook point (spec §13: theme.audio). Launch theme ships no
// audio, so this renders nothing until an event provides tracks. Autoplay
// stays off: playback starts only on explicit user toggle.
export function HomeAmbientAudio({ theme }: { theme: HomeWorldTheme }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const src = theme.audio?.ambient?.url ?? theme.audio?.music?.url;

  if (!src) {
    return null;
  }

  const toggle = () => {
    const el = audioRef.current;
    if (!el) {
      return;
    }
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play().then(() => setPlaying(true));
    }
  };

  return (
    <div className="pointer-events-auto absolute bottom-3 right-3 z-10">
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className="rounded-full border border-line bg-surface/90 px-3 py-1 text-xs font-semibold text-ink-subtle backdrop-blur"
      >
        {playing ? "Mute ambience" : "Play ambience"}
      </button>
    </div>
  );
}
