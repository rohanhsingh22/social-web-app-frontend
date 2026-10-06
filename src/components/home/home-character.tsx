import { Html } from "@react-three/drei";
import { DEFAULT_CHARACTER_CONFIG, type HomeMember } from "@/types/domain";
import { CharacterModel } from "@/components/character/character-model";
import { HomeCharacterLabel } from "./home-character-label";
import type { CharacterPosition } from "./home-character-layout";

// One Home occupant (spec #114): HomeMember + CharacterModel + identity
// label + presence dimming + speaking glow. Knows nothing about invitations,
// APIs, sockets, or the voice provider — voice state arrives as a boolean.
export function HomeCharacter({
  member,
  position,
  scale,
  speaking = false,
}: {
  member: HomeMember;
  position: CharacterPosition;
  scale: number;
  speaking?: boolean;
}) {
  const offline = member.presence === "offline";

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <CharacterModel
        config={member.characterConfig ?? DEFAULT_CHARACTER_CONFIG}
        opacity={offline ? 0.45 : 1}
      />
      {speaking && !offline && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.35, 48]} />
          <meshBasicMaterial color="#ff2e63" transparent opacity={0.75} />
        </mesh>
      )}
      <Html position={[0, 2.6, 0]} center zIndexRange={[10, 0]}>
        <HomeCharacterLabel member={member} speaking={speaking} />
      </Html>
    </group>
  );
}
