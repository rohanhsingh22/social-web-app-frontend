// Static catalog: 5 Tolies x 5 avatars under src/assets/toli-avatar.
// Backend keys look like `vector_01`; files look like `Vector/Vector-1.png`.
// The backend never serves image URLs, so the frontend resolves keys to
// bundled asset URLs here. Unknown keys resolve to null (swatch fallback).
import flux01 from "../assets/toli-avatar/Flux/Flux-1.webp";
import flux02 from "../assets/toli-avatar/Flux/Flux-2.webp";
import flux03 from "../assets/toli-avatar/Flux/Flux-3.webp";
import flux04 from "../assets/toli-avatar/Flux/Flux-4.webp";
import flux05 from "../assets/toli-avatar/Flux/Flux-5.webp";
import orbit01 from "../assets/toli-avatar/Orbit/Orbit-1.webp";
import orbit02 from "../assets/toli-avatar/Orbit/Orbit-2.webp";
import orbit03 from "../assets/toli-avatar/Orbit/Orbit-3.webp";
import orbit04 from "../assets/toli-avatar/Orbit/Orbit-4.webp";
import orbit05 from "../assets/toli-avatar/Orbit/Orbit-5.webp";
import quantum01 from "../assets/toli-avatar/Quantum/Quantum-1.webp";
import quantum02 from "../assets/toli-avatar/Quantum/Quantum-2.webp";
import quantum03 from "../assets/toli-avatar/Quantum/Quantum-3.webp";
import quantum04 from "../assets/toli-avatar/Quantum/Quantum-4.webp";
import quantum05 from "../assets/toli-avatar/Quantum/Quantum-5.webp";
import vector01 from "../assets/toli-avatar/Vector/Vector-1.webp";
import vector02 from "../assets/toli-avatar/Vector/Vector-2.webp";
import vector03 from "../assets/toli-avatar/Vector/Vector-3.webp";
import vector04 from "../assets/toli-avatar/Vector/Vector-4.webp";
import vector05 from "../assets/toli-avatar/Vector/Vector-5.webp";
import wave01 from "../assets/toli-avatar/Wave/Wave-1.webp";
import wave02 from "../assets/toli-avatar/Wave/Wave-2.webp";
import wave03 from "../assets/toli-avatar/Wave/Wave-3.webp";
import wave04 from "../assets/toli-avatar/Wave/Wave-4.webp";
import wave05 from "../assets/toli-avatar/Wave/Wave-5.webp";

const AVATAR_SWATCHES = [
  "bg-identity-rose-soft text-identity-rose-ink",
  "bg-identity-blue-soft text-identity-blue-ink",
  "bg-identity-violet-soft text-identity-violet-ink",
  "bg-identity-emerald-soft text-identity-emerald-ink",
  "bg-identity-amber-soft text-identity-amber-ink",
];

export function toliAvatarSwatch(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return AVATAR_SWATCHES[Math.abs(hash) % AVATAR_SWATCHES.length];
}

export function toliAvatarLabel(key: string): string {
  return key.split("_").pop() ?? key;
}

const TOLI_AVATAR_IMAGES: Record<string, string> = {
  flux_01: flux01,
  flux_02: flux02,
  flux_03: flux03,
  flux_04: flux04,
  flux_05: flux05,
  orbit_01: orbit01,
  orbit_02: orbit02,
  orbit_03: orbit03,
  orbit_04: orbit04,
  orbit_05: orbit05,
  quantum_01: quantum01,
  quantum_02: quantum02,
  quantum_03: quantum03,
  quantum_04: quantum04,
  quantum_05: quantum05,
  vector_01: vector01,
  vector_02: vector02,
  vector_03: vector03,
  vector_04: vector04,
  vector_05: vector05,
  wave_01: wave01,
  wave_02: wave02,
  wave_03: wave03,
  wave_04: wave04,
  wave_05: wave05,
};

export function resolveToliAvatarImage(
  avatarKey: string | null | undefined,
): string | null {
  if (!avatarKey) {
    return null;
  }
  return TOLI_AVATAR_IMAGES[avatarKey] ?? null;
}
