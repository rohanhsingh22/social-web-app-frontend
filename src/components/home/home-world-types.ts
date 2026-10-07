// Home world theme contract — mirrors backend (spec §13-16).
// This is the 3D world theme, NOT the light/dark/accent UI preference.

export type AssetRef = { url: string; kind?: string };

export type LightConfig = {
  color?: string;
  intensity?: number;
  position?: [number, number, number];
};

export type HomeWorldTheme = {
  id: string;
  name: string;
  version: number;
  environment: {
    background?: AssetRef;
    sky?: AssetRef;
    ground?: AssetRef;
    environmentModel?: AssetRef;
  };
  lighting: {
    ambient: LightConfig;
    directional?: LightConfig;
    pointLights?: LightConfig[];
  };
  atmosphere: {
    fog?: { color?: string; near?: number; far?: number };
    particles?: Array<{
      kind: string;
      count?: number;
      color?: string;
      size?: number;
      speed?: number;
      opacity?: number;
    }>;
    effects?: Array<{ kind: string; enabled?: boolean }>;
  };
  decorations: AssetRef[];
  audio?: { ambient?: AssetRef; music?: AssetRef };
  characterStage: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  };
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
};

export type HomeThemeLayer = {
  id: string;
  priority: number;
  environment?: Partial<HomeWorldTheme["environment"]>;
  lighting?: Partial<HomeWorldTheme["lighting"]>;
  atmosphere?: Partial<HomeWorldTheme["atmosphere"]>;
  decorations?: AssetRef[];
  audio?: HomeWorldTheme["audio"];
  // Server timing (spec §20): the backend filters on these before sending,
  // but local/edge layers carry them too — selectActiveLayers() enforces
  // the same rule client-side as defense in depth. The server clock wins.
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
};
