import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
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

// The Canvas `camera` prop only seeds the default camera on mount — it does
// NOT track later renders. Without this rig the camera stays frozen at the
// solo framing while the layout spreads for 2–4 members, pushing everyone
// except the owner out of frame (their HTML labels still show, which is
// exactly the reported symptom).
function CameraRig({ camera }: { camera: HomeCamera }) {
  const rawCamera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as {
    target: { set: (x: number, y: number, z: number) => void };
    update: () => void;
  } | null;

  useEffect(() => {
    const perspective = rawCamera as PerspectiveCamera;
    perspective.position.set(...camera.position);
    perspective.fov = camera.fov;
    perspective.updateProjectionMatrix();
    controls?.target.set(...camera.target);
    controls?.update();
  }, [rawCamera, controls, camera]);

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
}: {
  members: HomeMember[];
  speakingIds?: string[];
  interactive?: boolean;
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
  // Deterministic fallback: context-creation failures (disabled GPU,
  // sandboxed software GL) don't reliably reach the boundary below.
  const [webgl] = useState(isWebGLSupported);

  if (!webgl) {
    return <HomeStageFallback members={members} />;
  }

  return (
    <HomeCharacterErrorBoundary members={members}>
      <div className="relative h-full min-h-[420px] overflow-hidden">
        <Canvas
          shadows
          camera={{ position: camera.position, fov: camera.fov }}
          dpr={compact ? [1, 1.5] : [1, 2]}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[4, 8, 5]}
            intensity={1.6}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0004}
          />
          <directionalLight position={[-4, 5, -3]} intensity={0.5} />
          {/* Ground stage shared by all characters */}
          <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4.2, 48]} />
            <meshStandardMaterial color="#141627" roughness={0.9} />
          </mesh>
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
              />
            ))}
          </Suspense>
          <ContactShadows
            position={[0, 0.01, 0]}
            scale={10}
            blur={2.5}
            opacity={0.55}
            far={4}
            color="#000000"
          />
          {interactive && (
            <OrbitControls
              makeDefault
              enablePan={false}
              enableZoom
              enableRotate
              minPolarAngle={Math.PI / 2.4}
              maxPolarAngle={Math.PI / 2}
              minDistance={camera.minDistance}
              maxDistance={camera.maxDistance}
              target={camera.target}
            />
          )}
          <CameraRig camera={camera} />
        </Canvas>
        <HomeCharacterLoading />
      </div>
    </HomeCharacterErrorBoundary>
  );
}
