import { createTimelineState } from "./defaults";
import { clamp } from "./math";
import { interpolateParams, getTimelineDuration, type MorphTimelineFrame } from "./timeline";
import type { MorphParams, MorphTimelineState } from "../types/morph";

export function getTimelineProgress(
  elapsedSeconds: number,
  states: MorphTimelineState[],
  loop: boolean,
) {
  const totalDuration = getTimelineDuration(states);

  if (totalDuration <= 0) {
    return 0;
  }

  const normalizedElapsed = loop
    ? ((elapsedSeconds % totalDuration) + totalDuration) % totalDuration
    : clamp(elapsedSeconds, 0, totalDuration);

  return clamp(normalizedElapsed / totalDuration, 0, 1);
}

export function getElapsedFromProgress(
  states: MorphTimelineState[],
  progress: number,
) {
  const totalDuration = getTimelineDuration(states);

  if (totalDuration <= 0) {
    return 0;
  }

  return clamp(progress, 0, 1) * totalDuration;
}

function createBridgeState(label: string, params: MorphParams) {
  return createTimelineState(`bridge-${label}`, `Bridge ${label}`, params, 1);
}

function getAnchoredBridgeParams(from: MorphParams, to: MorphParams, amount: number) {
  const interpolated = interpolateParams(from, to, amount);

  return {
    ...interpolated,
    points: Math.max(from.points, to.points),
    moveX: from.moveX,
    moveY: from.moveY,
    moveZ: from.moveZ,
  };
}

export function createMorphBridgeFrame(
  fromFrame: MorphTimelineFrame,
  toFrame: MorphTimelineFrame,
  progress: number,
): MorphTimelineFrame {
  const t = clamp(progress, 0, 1);

  return {
    params: getAnchoredBridgeParams(fromFrame.params, toFrame.params, t),
    fromState: createBridgeState("source", fromFrame.params),
    toState: createBridgeState("target", toFrame.params),
    progress: t,
  };
}
