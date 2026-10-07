import { Component, type ReactNode } from "react";
import type { CharacterConfig } from "@/types/domain";
import { CHARACTER_MODEL_SRC, FALLBACK_CHARACTER_ID } from "./character-assets";
import { CharacterModel } from "./character-model";

// Per-model error boundary with fallback retry (Phase 8, task 17).
// A corrupt/missing GLB must never blank the whole Home stage: on load
// failure the model retries once against the compatibility fallback URL,
// and only renders nothing (label + stage survive) if that fails too.
// Resets whenever the character identity changes.

export function fallbackModelUrl(characterId: string): string | null {
  const src =
    CHARACTER_MODEL_SRC[characterId] ??
    CHARACTER_MODEL_SRC[FALLBACK_CHARACTER_ID]!;
  return src.fallbackUrl;
}

type BoundaryState = { attempt: 0 | 1 | 2 };

export class CharacterModelBoundary extends Component<
  {
    characterId?: string;
    config: CharacterConfig;
    position?: [number, number, number];
    scale?: number;
    opacity?: number;
    children?: ReactNode;
  },
  BoundaryState
> {
  state: BoundaryState = { attempt: 0 };

  static getDerivedStateFromError(): BoundaryState | null {
    // Moved to componentDidCatch logic via attempt gating below.
    return null;
  }

  componentDidCatch(): void {
    if (this.state.attempt === 0) {
      this.setState({ attempt: 1 });
    } else {
      this.setState({ attempt: 2 });
    }
  }

  componentDidUpdate(prevProps: { characterId?: string }): void {
    if (prevProps.characterId !== this.props.characterId && this.state.attempt !== 0) {
      this.setState({ attempt: 0 });
    }
  }

  render(): ReactNode {
    if (this.state.attempt === 2) {
      return null;
    }
    const { characterId, config, position, scale, opacity } = this.props;
    return (
      <CharacterModel
        key={`${characterId ?? "legacy"}-${this.state.attempt}`}
        characterId={characterId}
        config={config}
        position={position}
        scale={scale}
        opacity={opacity}
        modelUrlOverride={
          this.state.attempt === 1 && characterId
            ? (fallbackModelUrl(characterId) ?? undefined)
            : undefined
        }
      />
    );
  }
}
