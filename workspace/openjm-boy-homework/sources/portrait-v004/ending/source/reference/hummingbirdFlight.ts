/**
 * Flight model for the hummingbird in the dashboard loading overlay: the
 * layout for a viewport, behavior → body → pose each frame, and the two
 * exits (landing in the avatar slot, flying past).
 *
 * Pure over plain tuples: no three.js, no DOM and no clock, so the behavior
 * is testable without a browser. hummingbirdBehavior decides what the bird
 * wants, hummingbirdBody how it flies there and which way it faces; the scene
 * module owns rendering and pointer projection.
 *
 * Units are world units of the loader scene: a camera at z = CAMERA_Z looking
 * down -Z with a vertical field of view of CAMERA_FOV_DEGREES. The constants
 * are the approved tuning from the loader preview
 * (workspace/dashboard-3d-loader/preview/hummingbird-flight.js).
 */

import {
  bodyPose,
  clamp,
  clamp01,
  createBody,
  followTrajectory,
  integrateBody,
  length,
  orientBody,
  randomIn,
  scale,
  smooth,
  sub,
  type BodyPose,
  type BodyState,
  type HeadingCommand,
  type RandomSource,
  type Vec3,
} from "./hummingbirdBody";
import {
  createBehavior,
  observePointer,
  stepBehavior,
  type BehaviorState,
  type BehaviorStateName,
  type FlightBounds,
} from "./hummingbirdBehavior";

export type { FlightBounds } from "./hummingbirdBehavior";
export type { RandomSource, Vec3 } from "./hummingbirdBody";

export const CAMERA_FOV_DEGREES = 34;
export const CAMERA_Z = 9;
export const BIRD_HEIGHT = 1.55;

export const EXIT = {
  land: 1.05,
  flyPast: 1.0,
  landLift: 0.45,
  landTurn: 0.6,
  flyPastSpeed: 4.5,
  flyPastMargin: 1.8,
};

export const FLIGHT_CENTER: Vec3 = [0, 0.1, 0];
/** The approved bounds on a 16:10 view; `x` narrows with the viewport. */
export const DEFAULT_FLIGHT_BOUNDS: FlightBounds = {
  x: 3.0,
  yMin: -1.15,
  yMax: 1.25,
  zMin: -2.6,
  zMax: 1.2,
};

const MAX_STEP = 1 / 60;
/** Normalizes the speed that drives the trail and the motes' wake. */
const SPEED_REFERENCE = 3.4;
const START_DEPTH = -0.8;
const START_HEIGHT_RANGE = [0.25, 0.6] as const;
const START_SPEED_RANGE = [3.6, 4.0] as const;
/** The bird's center starts this far past the left edge, so its beak enters at once. */
const START_OFFSET = 0.7;
/** Horizontal bounds keep this far from the screen edge at z = 0. */
const BOUNDS_EDGE_MARGIN = 1.4;
/** The pointer is projected onto the bird's depth, within this range. */
const POINTER_DEPTH_RANGE = [-1.4, 0.8] as const;
/** Bird size limit on narrow viewports (share of the visible width at z = 0). */
const MAX_WINGSPAN_SHARE = 0.45;

export type FlightLayout = {
  aspect: number;
  bounds: FlightBounds;
  center: Vec3;
  birdScale: number;
  /** Center of the bird at the flight start, just off-screen left. */
  startX: number;
};

export type FlightInput = {
  /** The pointer in normalized device coordinates, or null when it is not over the overlay. */
  pointer: readonly [number, number] | null;
  /** The pointer moved or tapped since the last frame. */
  moved: boolean;
  /** A click hit the bird since the last frame. */
  hit: boolean;
};

export type ExitKind = "land" | "fly-past";

type ExitPlan = {
  kind: ExitKind;
  side: number;
  start: number;
  duration: number;
  from: { pos: Vec3; vel: Vec3; acc: Vec3 };
  target: Vec3;
  endVelocity: Vec3;
};

export type FlightState = {
  layout: FlightLayout;
  random: RandomSource;
  body: BodyState;
  behavior: BehaviorState;
  exit: ExitPlan | null;
  /** Flight time in seconds. */
  t: number;
};

export type FlightPose = BodyPose & {
  state: BehaviorStateName | "landing" | "flying-past";
  /** Speed normalized against the dart speed, in [0, 1]. */
  speed: number;
  /** Progress of the entrance toward the center, 0–1. */
  progress: number;
  /** The bird has settled at the center after its entrance. */
  arrived: boolean;
  exit: { kind: ExitKind; progress: number } | null;
};

/** Half of the visible height at a given depth. */
function visibleHalfHeight(depth: number) {
  return (CAMERA_Z - depth) * Math.tan(((CAMERA_FOV_DEGREES / 2) * Math.PI) / 180);
}

/**
 * Bounds, bird scale and start position for a viewport aspect ratio.
 * `birdAspect` is the model's widest horizontal extent (its wingspan) over
 * its height at scale 1.
 */
export function deriveFlightLayout(aspect: number, birdAspect: number): FlightLayout {
  const halfWidth = visibleHalfHeight(0) * aspect;
  const birdScale = Math.min(
    1,
    (MAX_WINGSPAN_SHARE * 2 * halfWidth) / (BIRD_HEIGHT * birdAspect),
  );
  const x = Math.max(
    0,
    Math.min(DEFAULT_FLIGHT_BOUNDS.x, halfWidth - BOUNDS_EDGE_MARGIN * birdScale),
  );

  return {
    aspect,
    bounds: { ...DEFAULT_FLIGHT_BOUNDS, x },
    center: [...FLIGHT_CENTER],
    birdScale,
    startX: -(visibleHalfHeight(START_DEPTH) * aspect + START_OFFSET * birdScale),
  };
}

/** Where a pointer in normalized device coordinates meets the plane z = depth. */
export function pointerToWorld(
  layout: FlightLayout,
  ndc: readonly [number, number],
  depth: number,
): Vec3 {
  const halfHeight = visibleHalfHeight(depth);
  return [ndc[0] * halfHeight * layout.aspect, ndc[1] * halfHeight, depth];
}

export function createFlight(layout: FlightLayout, random: RandomSource): FlightState {
  const pos: Vec3 = [layout.startX, randomIn(random, START_HEIGHT_RANGE), START_DEPTH];
  const toCenter = sub(layout.center, pos);
  const vel = scale(toCenter, randomIn(random, START_SPEED_RANGE) / length(toCenter));
  const body = createBody(pos, vel, Math.atan2(-vel[2], vel[0]), random);
  return {
    layout,
    random,
    body,
    behavior: createBehavior(layout, random, body),
    exit: null,
    t: 0,
  };
}

/** A resized viewport: the bird keeps flying under the new bounds. */
export function setFlightLayout(flight: FlightState, layout: FlightLayout) {
  flight.layout = layout;
  flight.behavior.layout = layout;
}

/** Advances the flight by dt seconds (in substeps of at most 1/60 s) and returns the pose to render. */
export function stepFlight(flight: FlightState, input: FlightInput, dt: number): FlightPose {
  const steps = Math.max(1, Math.ceil(dt / MAX_STEP - 1e-9));
  const h = dt / steps;
  if (flight.exit) {
    for (let i = 0; i < steps; i += 1) stepExit(flight, flight.exit, h);
    return exitPose(flight, flight.exit);
  }
  const { body, behavior } = flight;
  const depth = clamp(body.pos[2], ...POINTER_DEPTH_RANGE);
  const pointer = input.pointer ? pointerToWorld(flight.layout, input.pointer, depth) : null;
  observePointer(behavior, body, pointer, input.moved, flight.t, dt);
  for (let i = 0; i < steps; i += 1) {
    const first = i === 0;
    const stimuli = { moved: first && input.moved, hit: first && input.hit };
    const cmd = stepBehavior(behavior, body, stimuli, flight.t);
    integrateBody(body, cmd, flight.t, h);
    flight.t += h;
    orientBody(body, cmd, flight.t, h);
  }
  return flightPose(flight);
}

function flightPose(flight: FlightState): FlightPose {
  const b = flight.behavior;
  return {
    ...bodyPose(flight.body),
    state: b.state,
    speed: clamp01(length(flight.body.vel) / SPEED_REFERENCE),
    progress: b.progress,
    arrived: Number.isFinite(b.arrivedAt),
    exit: null,
  };
}

/* Exits: fixed-duration minimum-jerk trajectories, attitude from the same body model. */
function quintic(
  p0: number,
  v0: number,
  a0: number,
  p1: number,
  v1: number,
  a1: number,
  T: number,
  t: number,
) {
  const d = p1 - p0;
  const c3 = (20 * d - (8 * v1 + 12 * v0) * T - (3 * a0 - a1) * T * T) / (2 * T ** 3);
  const c4 = (-30 * d + (14 * v1 + 16 * v0) * T + (3 * a0 - 2 * a1) * T * T) / (2 * T ** 4);
  const c5 = (12 * d - 6 * (v1 + v0) * T - (a0 - a1) * T * T) / (2 * T ** 5);
  return [
    p0 + v0 * t + (a0 / 2) * t * t + c3 * t ** 3 + c4 * t ** 4 + c5 * t ** 5,
    v0 + a0 * t + 3 * c3 * t * t + 4 * c4 * t ** 3 + 5 * c5 * t ** 4,
    a0 + 6 * c3 * t + 12 * c4 * t * t + 20 * c5 * t ** 3,
  ] as const;
}

/**
 * Starts an exit. `target` is the landing point in the world for "land",
 * re-measured with setExitTarget every frame; "fly-past" ignores it and
 * leaves sideways in the direction the bird faces.
 */
export function startExit(flight: FlightState, kind: ExitKind, target?: Vec3) {
  const b = flight.body;
  const side = b.u < Math.PI ? 1 : -1;
  const z = b.pos[2];
  const flyPast: Vec3 = [
    side * (visibleHalfHeight(z) * flight.layout.aspect + EXIT.flyPastMargin),
    b.pos[1] + 0.3,
    z,
  ];
  const landing = kind === "land" && target !== undefined;
  flight.exit = {
    kind: landing ? "land" : "fly-past",
    side,
    start: flight.t,
    duration: landing ? EXIT.land : EXIT.flyPast,
    from: { pos: [...b.pos], vel: [...b.vel], acc: [...b.acc] },
    target: landing ? [...target] : flyPast,
    endVelocity: landing ? [0, 0, 0] : [side * EXIT.flyPastSpeed, 0.2, 0],
  };
}

export function setExitTarget(flight: FlightState, target: Vec3) {
  if (flight.exit?.kind === "land") flight.exit.target = [...target];
}

function exitState(e: ExitPlan, x: number) {
  const T = e.duration;
  const t = x * T;
  const pos: Vec3 = [0, 0, 0];
  const vel: Vec3 = [0, 0, 0];
  const acc: Vec3 = [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    [pos[i], vel[i], acc[i]] = quintic(
      e.from.pos[i],
      e.from.vel[i],
      e.from.acc[i],
      e.target[i],
      e.endVelocity[i],
      0,
      T,
      t,
    );
  }
  if (e.kind === "land") {
    // Rise a little on the way, then drop into the slot.
    const k = EXIT.landLift / 0.03456;
    const w = 1 - x;
    pos[1] += k * x ** 3 * w * w;
    vel[1] += (k * (3 * x * x * w * w - 2 * x ** 3 * w)) / T;
    acc[1] += (k * (6 * x * w * w - 12 * x * x * w + 2 * x ** 3)) / (T * T);
  }
  return { pos, vel, acc };
}

function stepExit(flight: FlightState, e: ExitPlan, h: number) {
  flight.t += h;
  const x = clamp01((flight.t - e.start) / e.duration);
  const s = exitState(e, x);
  followTrajectory(flight.body, s.pos, s.vel, s.acc);
  // Landing: face the slot, then pivot to the icon's heading while braking into it.
  let cmd: HeadingCommand;
  if (e.kind === "land") {
    cmd = x < EXIT.landTurn ? { gaze: e.target, faceTravel: true } : { gazeYaw: 0, pivot: true };
  } else {
    cmd = { gazeYaw: e.side > 0 ? 0 : Math.PI, faceTravel: true };
  }
  orientBody(flight.body, cmd, flight.t, h);
}

function exitPose(flight: FlightState, e: ExitPlan): FlightPose {
  const x = clamp01((flight.t - e.start) / e.duration);
  const pose = flightPose(flight);
  pose.exit = { kind: e.kind, progress: x };
  pose.state = e.kind === "land" ? "landing" : "flying-past";
  if (e.kind === "land") {
    // Settle into the icon's pose: pure profile facing right, level. Yaw eases through the back.
    const k = smooth(0.8, 1, x);
    pose.pitch *= 1 - k;
    pose.roll *= 1 - k;
    pose.yaw += (0 - pose.yaw) * smooth(0.9, 1, x);
  }
  return pose;
}
