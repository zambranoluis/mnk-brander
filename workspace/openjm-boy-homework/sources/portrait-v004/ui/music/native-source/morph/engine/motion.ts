import type { MorphParams } from "../types/morph";
import { clamp } from "./math";

export type MorphMotionState = {
  visualTime: number;
  rotationX: number;
  rotationY: number;
  pulse: number;
};

const LEGACY_FRAME_RATE = 60;
const TAU = Math.PI * 2;

export function createMorphMotionState(): MorphMotionState {
  return { visualTime: 0, rotationX: 0, rotationY: 0, pulse: 0 };
}

export function advanceMorphMotion(
  state: MorphMotionState,
  deltaSeconds: number,
  params: MorphParams,
  speedScale = 1,
): MorphMotionState {
  const delta = Math.max(0, deltaSeconds);
  const visualDelta = delta * params.speed * speedScale * LEGACY_FRAME_RATE;
  const pulse = state.pulse * Math.pow(params.pulseDecay, delta * LEGACY_FRAME_RATE);

  return {
    visualTime: state.visualTime + visualDelta,
    rotationX: state.rotationX + visualDelta * params.rotX,
    rotationY: state.rotationY + visualDelta * params.rotY,
    pulse,
  };
}

function normalizeAngle(angle: number) {
  return ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
}

export function interpolateMorphAngle(
  fromAngle: number,
  toAngle: number,
  progress: number,
) {
  const shortestDelta = normalizeAngle(toAngle - fromAngle);

  return normalizeAngle(fromAngle + shortestDelta * clamp(progress, 0, 1));
}

export function interpolateMorphMotion(
  from: MorphMotionState,
  to: MorphMotionState,
  progress: number,
): MorphMotionState {
  const amount = clamp(progress, 0, 1);

  return {
    visualTime: from.visualTime + (to.visualTime - from.visualTime) * amount,
    rotationX: interpolateMorphAngle(from.rotationX, to.rotationX, amount),
    rotationY: interpolateMorphAngle(from.rotationY, to.rotationY, amount),
    pulse: from.pulse + (to.pulse - from.pulse) * amount,
  };
}
