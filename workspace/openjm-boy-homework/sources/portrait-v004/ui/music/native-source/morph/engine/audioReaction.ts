import type { MorphAudioFrame, MorphMode, MorphParams, MorphPoint } from "../types/morph";
import { advanceMorphMotion, type MorphMotionState } from "./motion";
import { BLOOM_GEOMETRY } from "./shapes";

export type MorphAudioReaction = {
  frame: MorphAudioFrame;
  /** 0..1 blend of the reaction, following the transition into or out of the playing form. */
  amount: number;
  /**
   * The playing form's own clock. A mode transition blends the visible clock
   * between two modes, which would sweep the rings through many phases.
   */
  time: number;
};

/** The last frame of a song, kept so the form can ease back after it stops. */
type MorphHeldAudioFrame = { current: MorphAudioFrame | null };

type MorphAudioPoint = {
  x: number;
  y: number;
  z: number;
  sizeScale: number;
  opacityScale: number;
};

const CORE_BASS_SWELL = 0.32;
const CORE_PULSE_SWELL = 0.22;
const CORE_BOIL = 0.12;
const RAY_MIN_LENGTH = 0.08;
const RAY_BAND_REACH = 0.62;
const RAY_BASS_REACH = 0.08;
const RAY_PULSE_REACH = 0.1;
const RAY_TIP_GROWTH = 1.1;
const RAY_QUIET_FADE = 0.45;
const RAY_DEPTH_SWAY = 0.08;
const WAVE_SPEED = 0.37;
const WAVE_PULSE_GROWTH = 0.5;
const LEVEL_SPEED_BOOST = 1.5;

function fraction(value: number) {
  return value - Math.floor(value);
}

/**
 * Spectrum band under a planar position. Bass sits at the bottom of the bloom
 * and treble at the top, mirrored left and right; the angle comes from the
 * point's own position because cached points are not stored in shape order.
 */
function sampleAudioBand(x: number, y: number, spectrum: Float32Array) {
  const lastBand = spectrum.length - 1;

  if (lastBand < 0) {
    return 0;
  }

  // Screen +y points down, so an angle of 0 is the bottom of the bloom.
  const position = (Math.abs(Math.atan2(x, y)) / Math.PI) * lastBand;
  const lower = Math.floor(position);
  const upper = Math.min(lastBand, lower + 1);
  const weight = position - lower;

  return spectrum[lower] * (1 - weight) + spectrum[upper] * weight;
}

/**
 * Where a bloom point is drawn while music plays. The core swells with bass
 * and beats, each ray stretches to its spectrum band, and the rings travel
 * outward as shockwaves whose pace follows loudness through its clock. Every
 * change is scaled by the reaction amount, so amount 0 is the rest shape.
 */
export function reactPointToAudio(
  point: MorphPoint,
  reaction: MorphAudioReaction,
  pulse: number,
): MorphAudioPoint {
  const { amount, frame, time } = reaction;
  const rest = { x: point.origX, y: point.origY, z: point.origZ, sizeScale: 1, opacityScale: 1 };
  const coreSwell = frame.bass * CORE_BASS_SWELL + pulse * CORE_PULSE_SWELL;

  if (point.part === "core") {
    const boil = Math.sin(point.theta * 5 + point.phiZ * 3 + time * 3) * frame.level * CORE_BOIL;
    const scale = 1 + amount * (coreSwell + boil);

    return {
      ...rest,
      x: point.origX * scale,
      y: point.origY * scale,
      z: point.origZ * scale,
      sizeScale: 1 + amount * frame.bass * 0.4,
    };
  }

  const radius = Math.hypot(point.origX, point.origY);

  if (radius < 0.0001) {
    return rest;
  }

  if (point.part === "ray") {
    const { rayRoot, rayRestLength } = BLOOM_GEOMETRY;
    const along = Math.max(0, (radius - rayRoot) / rayRestLength);
    const band = sampleAudioBand(point.origX, point.origY, frame.spectrum);
    const length =
      RAY_MIN_LENGTH + band * RAY_BAND_REACH + frame.bass * RAY_BASS_REACH + pulse * RAY_PULSE_REACH;
    // Rays stay rooted on the core surface as it swells.
    const reachedRadius = rayRoot * (1 + coreSwell) + along * length;
    const scale = 1 + amount * (reachedRadius / radius - 1);
    const sway = Math.sin(Math.atan2(point.origX, point.origY) * 3 + time * 1.5) * RAY_DEPTH_SWAY * along;

    return {
      x: point.origX * scale,
      y: point.origY * scale,
      z: point.origZ + amount * sway,
      sizeScale: 1 + amount * band * along * RAY_TIP_GROWTH,
      opacityScale: 1 - amount * (1 - band) * Math.min(1, along) * RAY_QUIET_FADE,
    };
  }

  if (point.part === "wave") {
    const { waveInner, waveSpan } = BLOOM_GEOMETRY;
    const restPhase = Math.min(1, Math.max(0, (radius - waveInner) / waveSpan));
    const phase = fraction(restPhase + time * WAVE_SPEED);
    const scale = 1 + (amount * (phase - restPhase) * waveSpan) / radius;
    // Rings are born faint at the core, peak mid-flight and fade at the edge;
    // loud passages and beats make them brighter.
    const envelope = Math.sin(phase * Math.PI) ** 0.8;
    const strength = Math.min(1, 0.3 + frame.level * 0.7 + pulse * 0.4);

    return {
      x: point.origX * scale,
      y: point.origY * scale,
      z: point.origZ,
      sizeScale: 1 + amount * pulse * WAVE_PULSE_GROWTH,
      opacityScale: 1 + amount * (envelope * strength - 1),
    };
  }

  return rest;
}

/**
 * How strongly the visible form reacts to audio: fully in "playing", and
 * blended by the transition progress while entering or leaving it.
 */
export function resolveAudioAmount(
  activeMode: MorphMode,
  transition: { targetMode: MorphMode; fromAudioAmount: number; progress: number } | null,
) {
  if (!transition) {
    return activeMode === "playing" ? 1 : 0;
  }

  const targetAmount = transition.targetMode === "playing" ? 1 : 0;

  return transition.fromAudioAmount + (targetAmount - transition.fromAudioAmount) * transition.progress;
}

/**
 * Reads the playing song's frame. Pause or end stops the frame source at
 * once, so the last frame is held, with its beat cleared, while the reaction
 * fades out by its amount; otherwise the form would snap back first.
 */
export function readAudioReaction(
  readAudioFrame: ((nowMs: number) => MorphAudioFrame | null) | undefined,
  nowMs: number,
  amount: number,
  time: number,
  held: MorphHeldAudioFrame,
): MorphAudioReaction | undefined {
  if (amount <= 0) {
    held.current = null;
    return undefined;
  }

  const live = readAudioFrame?.(nowMs);

  if (live) {
    held.current = live.beat > 0 ? { ...live, beat: 0 } : live;
  }

  const frame = live ?? held.current;

  return frame ? { frame, amount, time } : undefined;
}

/**
 * Advances motion with loudness-driven speed and starts a size pulse on a
 * beat, the same mechanism as the pointer-down pulse.
 */
export function advanceReactiveMotion(
  motion: MorphMotionState,
  deltaSeconds: number,
  params: MorphParams,
  reaction: MorphAudioReaction | undefined,
  beatPulseForce: number,
): MorphMotionState {
  if (!reaction) {
    return advanceMorphMotion(motion, deltaSeconds, params);
  }

  const speedScale = 1 + reaction.frame.level * LEVEL_SPEED_BOOST * reaction.amount;
  const advanced = advanceMorphMotion(motion, deltaSeconds, params, speedScale);

  if (reaction.frame.beat <= 0) {
    return advanced;
  }

  return {
    ...advanced,
    pulse: Math.max(advanced.pulse, beatPulseForce * reaction.frame.beat * reaction.amount),
  };
}
