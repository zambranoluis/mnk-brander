export type MorphShape =
  | "sphere"
  | "cube"
  | "pyramid"
  | "music"
  | "image"
  | "code"
  | "video"
  | "bloom";

export type MorphCloudShape = "sphere" | "cube" | "pyramid" | "ring";

export type MorphTransitionEase = "smooth" | "linear" | "ease-in" | "ease-out";

export type MorphTransitionEffect = "direct" | "particle-cloud" | "helix" | "double-helix";

export const MORPH_MODES = [
  "standby",
  "working",
  "music",
  "image",
  "code",
  "video",
  "menuOpen",
  "playing",
] as const;

export type MorphMode = (typeof MORPH_MODES)[number];

export type MorphHelixDirection = "forward" | "reverse";

export type MorphParams = {
  shape: MorphShape;
  color1: string;
  color2: string;
  backgroundColor: string;
  figureOpacity: number;
  points: number;
  size: number;
  sphereRadius: number;
  trail: number;
  moveX: number;
  moveY: number;
  moveZ: number;
  speed: number;
  morph: number;
  rotX: number;
  rotY: number;
  pulseForce: number;
  pulseDecay: number;
  sizeImpact: number;
  speedImpact: number;
};

export type MorphCloudSettings = {
  spread: number;
  chaos: number;
  pointSize: number;
  pointAmount: number;
  objectScale: number;
  shape: MorphCloudShape;
  vortexStrength: number;
  vortexSpeed: number;
};

export type MorphHelixSettings = {
  direction: MorphHelixDirection;
  angle: number;
  axisX: number;
  axisY: number;
  axisZ: number;
  autoOrbit: boolean;
  tunnel: number;
  thickness: number;
  loops: number;
  cloud: boolean;
  cloudIntensity: number;
  drawDirection: MorphHelixDirection;
};

export type MorphTimelineState = {
  id: string;
  name: string;
  duration: number;
  data: MorphParams;
  transitionEase: MorphTransitionEase;
  transitionEffect: MorphTransitionEffect;
  cloud: MorphCloudSettings;
  helix: MorphHelixSettings;
};

export type MorphPreset = {
  version: "morph-preset-v1";
  name: string;
  params: MorphParams;
  timeline: MorphTimelineState[];
  duration: number;
  loop: boolean;
};

/** The component of a composite shape a point belongs to; the audio reaction reads it. */
export type MorphPointPart = "core" | "ray" | "wave";

export type MorphPoint = {
  origX: number;
  origY: number;
  origZ: number;
  theta: number;
  phiZ: number;
  part?: MorphPointPart;
};

/** One analysed audio frame; every value is normalized to 0..1. */
export type MorphAudioFrame = {
  level: number;
  bass: number;
  mid: number;
  treble: number;
  /** 0 when no beat started on this frame, otherwise the beat's strength. */
  beat: number;
  /** Log-spaced bands from low to high frequency. */
  spectrum: Float32Array;
};

export type MorphRgb = {
  r: number;
  g: number;
  b: number;
};
