import type {
  MorphCloudSettings,
  MorphHelixSettings,
  MorphParams,
  MorphPreset,
  MorphTimelineState,
} from "../types/morph";

export const DEFAULT_MORPH_PARAMS: MorphParams = {
  shape: "sphere",
  color1: "#00ffc8",
  color2: "#ff0077",
  backgroundColor: "#000000",
  figureOpacity: 1,
  points: 1500,
  size: 2,
  sphereRadius: 0.3,
  trail: 1,
  moveX: 0,
  moveY: 0,
  moveZ: 0,
  speed: 0.03,
  morph: 0.25,
  rotX: 0.2,
  rotY: 0.3,
  pulseForce: 3,
  pulseDecay: 0.92,
  sizeImpact: 2,
  speedImpact: 0.05,
};

export const DEFAULT_CLOUD_SETTINGS: MorphCloudSettings = {
  spread: 2.2,
  chaos: 0.8,
  pointSize: 0.75,
  pointAmount: 1,
  objectScale: 1,
  shape: "sphere",
  vortexStrength: 0.6,
  vortexSpeed: 1.2,
};

export const DEFAULT_HELIX_SETTINGS: MorphHelixSettings = {
  direction: "forward",
  angle: 0,
  axisX: 0,
  axisY: 1,
  axisZ: 0,
  autoOrbit: false,
  tunnel: 0,
  thickness: 1,
  loops: 4.3,
  cloud: false,
  cloudIntensity: 0.8,
  drawDirection: "forward",
};

export function cloneMorphParams(params: MorphParams): MorphParams {
  return { ...params };
}

export function createTimelineState(
  id: string,
  name: string,
  params: MorphParams,
  duration = 2.5,
): MorphTimelineState {
  return {
    id,
    name,
    duration,
    data: cloneMorphParams(params),
    transitionEase: "smooth",
    transitionEffect: "direct",
    cloud: { ...DEFAULT_CLOUD_SETTINGS },
    helix: { ...DEFAULT_HELIX_SETTINGS },
  };
}

export function createDefaultMorphPreset(): MorphPreset {
  return {
    version: "morph-preset-v1",
    name: "OpenJM morph workspace",
    params: cloneMorphParams(DEFAULT_MORPH_PARAMS),
    timeline: [],
    duration: 5,
    loop: true,
  };
}
