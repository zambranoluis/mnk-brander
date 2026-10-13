import type { MorphParams, MorphTimelineState } from "../types/morph";
import { lerpHexColor } from "./colors";
import { applyTransitionEasing, clamp, lerp } from "./math";

export type MorphTimelineFrame = {
  params: MorphParams;
  fromState: MorphTimelineState | null;
  toState: MorphTimelineState | null;
  progress: number;
};

export function getTimelineDuration(states: MorphTimelineState[]) {
  return states.reduce((total, state) => total + Math.max(0.01, state.duration), 0);
}

export function interpolateParams(from: MorphParams, to: MorphParams, amount: number): MorphParams {
  const t = clamp(amount, 0, 1);

  return {
    shape: t < 0.5 ? from.shape : to.shape,
    color1: lerpHexColor(from.color1, to.color1, t),
    color2: lerpHexColor(from.color2, to.color2, t),
    backgroundColor: lerpHexColor(from.backgroundColor, to.backgroundColor, t),
    figureOpacity: lerp(from.figureOpacity, to.figureOpacity, t),
    points: Math.round(lerp(from.points, to.points, t)),
    size: lerp(from.size, to.size, t),
    sphereRadius: lerp(from.sphereRadius, to.sphereRadius, t),
    trail: lerp(from.trail, to.trail, t),
    moveX: lerp(from.moveX, to.moveX, t),
    moveY: lerp(from.moveY, to.moveY, t),
    moveZ: lerp(from.moveZ, to.moveZ, t),
    speed: lerp(from.speed, to.speed, t),
    morph: lerp(from.morph, to.morph, t),
    rotX: lerp(from.rotX, to.rotX, t),
    rotY: lerp(from.rotY, to.rotY, t),
    pulseForce: lerp(from.pulseForce, to.pulseForce, t),
    pulseDecay: lerp(from.pulseDecay, to.pulseDecay, t),
    sizeImpact: lerp(from.sizeImpact, to.sizeImpact, t),
    speedImpact: lerp(from.speedImpact, to.speedImpact, t),
  };
}

export function resolveTimelineFrame(
  baseParams: MorphParams,
  states: MorphTimelineState[],
  elapsedSeconds: number,
  loop: boolean,
): MorphTimelineFrame {
  if (states.length < 2) {
    return {
      params: baseParams,
      fromState: null,
      toState: null,
      progress: 0,
    };
  }

  const totalDuration = getTimelineDuration(states);
  const rawTime = loop
    ? ((elapsedSeconds % totalDuration) + totalDuration) % totalDuration
    : clamp(elapsedSeconds, 0, totalDuration);
  let cursor = 0;

  for (let index = 0; index < states.length; index += 1) {
    const fromState = states[index];
    const toState = states[(index + 1) % states.length];
    const duration = Math.max(0.01, fromState.duration);

    if (rawTime <= cursor + duration || index === states.length - 1) {
      const progress = applyTransitionEasing((rawTime - cursor) / duration, fromState.transitionEase);

      return {
        params: interpolateParams(fromState.data, toState.data, progress),
        fromState,
        toState,
        progress,
      };
    }

    cursor += duration;
  }

  return {
    params: states[states.length - 1].data,
    fromState: states[states.length - 1],
    toState: states[0],
    progress: 1,
  };
}
