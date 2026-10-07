import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PerspectiveCamera } from "three";
import type { HomeMember } from "@/types/domain";
import { HomeCharacter } from "./home-character";
import { getHomeCamera, type HomeCamera } from "./home-character-camera";
import { getHomeCharacterLayout } from "./home-character-layout";
import { HomeCharacterLoading } from "./home-character-loading";
import { isWebGLSupported } from "./home-webgl";
import { HomeWorld } from "./HomeWorld";
import { HomeAmbientAudio } from "./HomeAmbientAudio";
import { HomeIdentityCard } from "./home-identity-card";
import { HomePerfProbe } from "./HomePerfProbe";
import { defaultHomeWorld } from "./HomeThemeResolver";
import type { HomeWorldTheme } from "./home-world-types";
import {
  useAccentColor,
  usePrefersReducedMotion,
  useTabVisible,
  useUiColorMode,
} from "./use-home-stage-prefs";

// Village camera: the Canvas `camera` prop only seeds the default
// camera on mount — it does NOT track later renders, so this rig owns the
// framing (member-count changes re-seat it). The camera never orbits: it
// holds a fixed cinematic frame over the village stage with an ultra-slow
// drift so the screen feels alive while only the characters truly move.
// Drift pauses under reduced-motion.
function CameraRig({
  camera,
  drift = true,
}: {
  camera: HomeCamera;
  drift?: boolean;
}) {
  const rawCamera = useThree((s) => s.camera);

  useEffect(() => {
    const perspective = rawCamera as PerspectiveCamera;
    perspective.position.set(...camera.position);
    perspective.fov = camera.fov;
    perspective.updateProjectionMatrix();
    perspective.lookAt(...camera.target);
  }, [rawCamera, camera]);

  useFrame(({ clock }) => {
    if (!drift) {
      return;
    }
    const t = clock.elapsedTime;
    const perspective = rawCamera as PerspectiveCamera;
    // ±0.15 units over ~60s — perceptible life, no motion sickness.
    perspective.position.x = camera.position[0] + Math.sin(t * 0.1) * 0.15;
    perspective.position.y = camera.position[1] + Math.sin(t * 0.13 + 1) * 0.06;
    perspective.lookAt(...camera.target);
  });

  return null;
}

function useCompactStage(): boolean {  const query = "(max-width: 768px)";
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setCompact(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return compact;
}

// The 3D Home must never crash the app (spec #129): connections, messages,
// and navigation keep working behind this boundary.
class HomeCharacterErrorBoundary extends Component<
  { members: HomeMember[]; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <HomeStageFallback members={this.props.members} />;
    }

    return this.props.children;
  }
}

// Static fallback when WebGL is unavailable or the scene throws: identity
// without 3D, same member order.
function HomeStageFallback({ members }: { members: HomeMember[] }) {
  return (
    <div className="grid h-full min-h-[420px] place-items-center p-6">
      <ul className="grid w-full max-w-md grid-cols-2 gap-3" aria-label="Home members">
        {members.map((member) => (
          <li
            key={member.userId}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand"
            >
              {member.displayName.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">
                {member.displayName}
              </span>
              <span className="block text-xs text-ink-subtle">
                {member.role === "OWNER" ? "Owner" : "Member"}
                {member.presence === "offline" ? " · Offline" : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Multi-character Home stage (Phase 11): one Canvas, up to four characters
// with stable member identity, responsive layout, and offline/speaking
// states. Voice state arrives as ids — never the voice SDK (spec #132).
export function HomeCharacterScene({
  members,
  speakingIds = [],
  interactive = true,
  worldTheme,
  accentColor,
}: {
  members: HomeMember[];
  speakingIds?: string[];
  interactive?: boolean;
  worldTheme?: HomeWorldTheme;
  accentColor?: string;
}) {
  const compact = useCompactStage();
  // Duplicate identities collapse React keys and stack models at one slot.
  // The backend guarantees uniqueness; this keeps a corrupt payload from
  // silently breaking the stage.
  const uniqueMembers = useMemo(() => {
    const seen = new Set<string>();
    return members.filter((member) => {
      if (seen.has(member.userId)) {
        return false;
      }
      seen.add(member.userId);
      return true;
    });
  }, [members]);
  const layout = getHomeCharacterLayout(uniqueMembers.length, { compact });
  const camera = getHomeCamera(uniqueMembers.length, { compact });
  const speaking = new Set(speakingIds);
  const reducedMotion = usePrefersReducedMotion();
  const tabVisible = useTabVisible();
  const liveAccent = useAccentColor();
  const accent = accentColor ?? liveAccent;
  const colorMode = useUiColorMode();
  // Deterministic fallback: context-creation failures (disabled GPU,
  // sandboxed software GL) don't reliably reach the boundary below.
  const [webgl] = useState(isWebGLSupported);
  // Identity card selection (spec §22): click/tap a character.
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedMember =
    uniqueMembers.find((m) => m.userId === selectedUserId) ?? null;

  if (!webgl) {
    return <HomeStageFallback members={members} />;
  }

  // Explicit (server/event) themes always win; otherwise the permanent
  // Hirotoli Village renders — UI light/dark mode never changes the 3D
  // world (spec §19), it only styles CSS/UI chrome.
  const theme = worldTheme ?? defaultHomeWorld();

  // Cinematic vignette: cheap CSS radial overlay (no postprocessing GPU
  // cost) that frames the scene like a game lobby in both modes.
  const vignette =
    colorMode === "light"
      ? "radial-gradient(ellipse at center, transparent 55%, rgba(30,41,59,0.22) 100%)"
      : "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)";

  return (
    <HomeCharacterErrorBoundary members={members}>
      {/* isolate: keeps 3D DOM overlays (labels, vignette) in a local
          stacking context so they can never cover page chrome. */}
      <div
        className={`relative isolate h-full overflow-hidden ${compact ? "min-h-[320px]" : "min-h-[480px]"}`}
      >
        <Canvas
          shadows
          camera={{ position: camera.position, fov: camera.fov }}
          dpr={compact ? [1, 1.5] : [1, 2]}
          frameloop={tabVisible ? "always" : "never"}
        >
          <HomeWorld
            theme={theme}
            accentColor={accent}
            reducedMotion={reducedMotion}
            compact={compact}
          >
            <Suspense fallback={null}>
              {uniqueMembers.map((member, index) => (
                <HomeCharacter
                  key={member.userId}
                  member={member}
                  position={
                    layout.positions[index] ?? ([0, 0, 0] as [number, number, number])
                  }
                  scale={layout.scale}
                  speaking={speaking.has(member.userId)}
                  onSelect={(selected) => setSelectedUserId(selected.userId)}
                />
              ))}
            </Suspense>
          </HomeWorld>
          {/* Fixed village camera: drift only (no orbiting) when interactive,
              fully static under reduced-motion. */}
          <CameraRig camera={camera} drift={interactive && !reducedMotion} />
          {import.meta.env.DEV && <HomePerfProbe />}
        </Canvas>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: vignette }}
        />
        <HomeCharacterLoading />
        <HomeAmbientAudio theme={theme} />
        {selectedMember && (
          <HomeIdentityCard
            member={selectedMember}
            open={selectedMember !== null}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedUserId(null);
              }
            }}
          />
        )}
      </div>
    </HomeCharacterErrorBoundary>
  );
}
