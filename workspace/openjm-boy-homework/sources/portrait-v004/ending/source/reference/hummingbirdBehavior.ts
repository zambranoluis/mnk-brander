/**
 * Behavior layer of the loader hummingbird: a state machine that turns
 * stimuli (the pointer moving, the pointer rushing at the bird, a click on
 * the bird) into a goal, a gaze and a flight profile for the body layer.
 *
 * Pure; the random source is injected. The tuning lives in
 * hummingbirdBehaviorTuning.
 */

import {
  add,
  clamp,
  clamp01,
  facingSide,
  headingError,
  length,
  randomIn,
  scale,
  smooth,
  sub,
  uToYaw,
  type BodyState,
  type MotionCommand,
  type RandomSource,
  type Vec3,
} from "./hummingbirdBody";
import { BEHAVIOR, FLIGHT } from "./hummingbirdBehaviorTuning";

export type FlightBounds = {
  x: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
};

export type BehaviorLayout = { bounds: FlightBounds; center: Vec3 };

export type BehaviorStateName =
  | "entering"
  | "hovering"
  | "darting"
  | "noticing"
  | "inspecting"
  | "evading"
  | "startled";

type Hover = {
  anchor: Vec3;
  until: number;
  side: number;
  yaw: number;
  scans: Array<{ at: number; offset: number }>;
  flicks: number[];
  probe: number | null;
};
type Dart = {
  target: Vec3;
  slip: boolean;
  from: Vec3;
  yaw: number;
  phase: "orient" | "go";
  orientUntil: number;
};
type Inspect = { side: number; start: number; caution: number; depth: number; goal: Vec3 };
type Evade = { goal: Vec3; fleeUntil: number; pauseUntil: number; yaw: number };
type Startle = {
  goal: Vec3;
  until: number;
  holdUntil: number;
  yaw: number;
  resume: { state: BehaviorStateName; dart: Dart | null };
};

export type BehaviorState = {
  layout: BehaviorLayout;
  random: RandomSource;
  state: BehaviorStateName;
  since: number;
  /** Flight time at which the bird settled at the center; Infinity until then. */
  arrivedAt: number;
  /** Progress of the entrance toward the center, 0–1, never decreasing. */
  progress: number;
  startDistance: number;
  hover: Hover | null;
  dart: Dart | null;
  notice: { at: number; command: MotionCommand | null } | null;
  inspect: Inspect | null;
  evade: Evade | null;
  startle: Startle | null;
  pointer: { pos: Vec3 | null; closing: number; distance: number; movedAt: number };
  lastCommand: MotionCommand | null;
};

export type BehaviorStimuli = { moved: boolean; hit: boolean };

const profileYaw = (side: number) =>
  side > 0 ? -BEHAVIOR.profileTurn : Math.PI + BEHAVIOR.profileTurn;
const beakFlat = (body: BodyState): Vec3 => {
  const yaw = uToYaw(body.u);
  return [Math.cos(yaw), 0, -Math.sin(yaw)];
};

function clampToBounds(p: Vec3, bounds: FlightBounds, margin = 0): Vec3 {
  return [
    clamp(p[0], -bounds.x + margin, bounds.x - margin),
    clamp(p[1], bounds.yMin + margin, bounds.yMax - margin),
    clamp(p[2], bounds.zMin + margin, bounds.zMax - margin),
  ];
}

function insideFlowerArea(p: Vec3, bounds: FlightBounds) {
  const m = BEHAVIOR.flowerMargin;
  const [zLow, zHigh] = BEHAVIOR.flowerDepth;
  const inPlane = Math.abs(p[0]) <= bounds.x - m && p[1] >= bounds.yMin + m && p[1] <= bounds.yMax - m;
  return inPlane && p[2] >= zLow && p[2] <= zHigh;
}

function setState(b: BehaviorState, state: BehaviorStateName, t: number) {
  b.state = state;
  b.since = t;
}

export function createBehavior(
  layout: BehaviorLayout,
  random: RandomSource,
  body: BodyState,
): BehaviorState {
  return {
    layout,
    random,
    state: "entering",
    since: 0,
    arrivedAt: Infinity,
    progress: 0,
    startDistance: length(sub(layout.center, body.pos)),
    hover: null,
    dart: null,
    notice: null,
    inspect: null,
    evade: null,
    startle: null,
    pointer: { pos: null, closing: 0, distance: Infinity, movedAt: -Infinity },
    lastCommand: null,
  };
}

/** Once per frame: where the pointer is and how fast it closes on the bird. */
export function observePointer(
  b: BehaviorState,
  body: BodyState,
  pointer: Vec3 | null,
  moved: boolean,
  t: number,
  dt: number,
) {
  const previous = b.pointer.pos;
  let closing = 0;
  if (pointer && previous && dt > 0) {
    const vx = (pointer[0] - previous[0]) / dt;
    const vy = (pointer[1] - previous[1]) / dt;
    const dx = body.pos[0] - pointer[0];
    const dy = body.pos[1] - pointer[1];
    const d = Math.hypot(dx, dy) || 1;
    closing = (vx * dx + vy * dy) / d;
  }
  b.pointer.closing += (closing - b.pointer.closing) * Math.min(1, dt / BEHAVIOR.rush.smoothing);
  if (pointer && moved) b.pointer.movedAt = t;
  b.pointer.pos = pointer ? [...pointer] : null;
  b.pointer.distance = pointer
    ? Math.hypot(body.pos[0] - pointer[0], body.pos[1] - pointer[1])
    : Infinity;
}

/** Only a pointer that comes at the bird is a threat; flying past a still pointer is not. */
function threatened(b: BehaviorState, t: number) {
  const p = b.pointer;
  const r = BEHAVIOR.rush;
  if (!p.pos || t - p.movedAt > r.recent || p.closing <= r.creep) return false;
  return p.distance < r.personalSpace || (p.closing > r.speed && p.distance < r.radius);
}

export function stepBehavior(
  b: BehaviorState,
  body: BodyState,
  stimuli: BehaviorStimuli,
  t: number,
): MotionCommand {
  const arrived = t >= b.arrivedAt;
  const calm = b.state !== "evading" && b.state !== "startled";
  if (arrived && stimuli.hit && b.state !== "startled") startStartle(b, body, t);
  else if (arrived && calm && threatened(b, t)) startEvade(b, body, t);
  else if (
    arrived &&
    stimuli.moved &&
    b.pointer.pos &&
    (b.state === "hovering" || b.state === "darting")
  ) {
    startNotice(b, t);
  }
  const cmd = STATES[b.state](b, body, t);
  b.lastCommand = cmd;
  return cmd;
}

/* Entering: dart in from the side, brake upright, settle at the center. */
function entering(b: BehaviorState, body: BodyState, t: number): MotionCommand {
  const center = b.layout.center;
  const d = length(sub(center, body.pos));
  b.progress = Math.max(b.progress, clamp01(1 - d / b.startDistance));
  if (d < BEHAVIOR.arrival.distance && length(body.vel) < BEHAVIOR.arrival.speed) {
    b.arrivedAt = t;
    b.progress = 1;
    startHover(b, body, t, center);
    return hovering(b, body, t);
  }
  return { goal: center, ...FLIGHT.entering, faceTravel: true, gazeYaw: profileYaw(1) };
}

/* Hovering: station keeping at a flower, scanning, flicking the tail, probing. */
function startHover(b: BehaviorState, body: BodyState, t: number, anchor: Vec3) {
  const r = b.random;
  const side = facingSide(body.u);
  const duration = randomIn(r, BEHAVIOR.hoverTime);
  const scans = Array.from({ length: r() < 0.5 ? 1 : 2 }, () => ({
    at: t + duration * (0.2 + 0.6 * r()),
    offset: (r() * 2 - 1) * BEHAVIOR.scanOffset,
  })).sort((a, c) => a.at - c.at);
  const flicks = Array.from({ length: r() < 0.5 ? 1 : 2 }, () => t + duration * r());
  const probe = r() < BEHAVIOR.probe.chance ? t + 0.2 + (duration - 0.6) * r() : null;
  b.hover = { anchor: [...anchor], until: t + duration, side, yaw: profileYaw(side), scans, flicks, probe };
  setState(b, "hovering", t);
}

function hovering(b: BehaviorState, body: BodyState, t: number): MotionCommand {
  const h = b.hover!;
  while (h.scans.length && t >= h.scans[0].at) {
    h.yaw = profileYaw(h.side) + h.scans.shift()!.offset;
  }
  let goal = h.anchor;
  if (h.probe !== null) {
    const x = (t - h.probe) / BEHAVIOR.probe.time;
    if (x >= 0 && x <= 1) {
      goal = add(h.anchor, scale(beakFlat(body), BEHAVIOR.probe.reach * Math.sin(Math.PI * x)));
    }
  }
  const tail = h.flicks.reduce((sum, at) => {
    const x = (t - at) / BEHAVIOR.flick.time;
    return x >= 0 && x <= 1 ? sum + BEHAVIOR.flick.strength * Math.sin(Math.PI * x) : sum;
  }, 0);
  if (t >= h.until) {
    startDart(b, body, t);
    return darting(b, body, t);
  }
  return { goal, ...FLIGHT.hover, gazeYaw: h.yaw, tail };
}

/* Darting: to the next flower, mostly lateral; short moves are side-slips. */
function pickFlower(b: BehaviorState, from: Vec3): Vec3 {
  const { bounds } = b.layout;
  const r = b.random;
  const roomRight = bounds.x - from[0];
  const roomLeft = from[0] + bounds.x;
  for (let i = 0; i < 24; i += 1) {
    const reach = randomIn(r, BEHAVIOR.dart);
    const dy = (r() * 2 - 1) * 0.7;
    if (reach * reach <= dy * dy) continue;
    const dir = r() * (roomRight + roomLeft) < roomRight ? 1 : -1;
    const q = (r() * 2 - 1) * BEHAVIOR.dartDepth;
    const ax = Math.sqrt((reach * reach - dy * dy) / (1 + q * q));
    const p: Vec3 = [from[0] + dir * ax, from[1] + dy, from[2] + q * ax];
    if (insideFlowerArea(p, bounds)) return p;
  }
  // No dart fits (a narrow viewport): cross toward the other side, inside the flower area.
  const [zLow, zHigh] = BEHAVIOR.flowerDepth;
  return clampToBounds(
    [
      from[0] - Math.sign(from[0] || 1) * 1.5,
      clamp(from[1], bounds.yMin + 0.3, bounds.yMax - 0.3),
      clamp(from[2], zLow, zHigh),
    ],
    bounds,
    BEHAVIOR.flowerMargin,
  );
}

function pickSlip(b: BehaviorState, from: Vec3): Vec3 {
  const { bounds } = b.layout;
  const r = b.random;
  const reach = randomIn(r, BEHAVIOR.slip);
  const dir = Math.abs(from[0] + reach) <= bounds.x - BEHAVIOR.flowerMargin && r() < 0.5 ? 1 : -1;
  return clampToBounds(
    [from[0] + dir * reach, from[1] + (r() * 2 - 1) * 0.15, from[2]],
    bounds,
    BEHAVIOR.flowerMargin,
  );
}

function startDart(b: BehaviorState, body: BodyState, t: number) {
  const slip = b.random() < BEHAVIOR.slipChance;
  b.dart = {
    target: slip ? pickSlip(b, body.pos) : pickFlower(b, body.pos),
    slip,
    from: [...body.pos],
    yaw: uToYaw(body.u),
    phase: slip ? "go" : "orient",
    orientUntil: t + BEHAVIOR.orientTimeout,
  };
  setState(b, "darting", t);
}

function darting(b: BehaviorState, body: BodyState, t: number): MotionCommand {
  const d = b.dart!;
  if (length(sub(d.target, body.pos)) < 0.2 && length(body.vel) < 0.35) {
    startHover(b, body, t, d.target);
    return hovering(b, body, t);
  }
  if (d.slip) return { goal: d.target, ...FLIGHT.slip, gazeYaw: d.yaw };
  const cmd: MotionCommand = { goal: d.target, ...FLIGHT.dart, gaze: d.target, faceTravel: true };
  if (d.phase === "orient") {
    // Pivot toward the flower first, then go.
    if ((!body.pivot && headingError(body, cmd) < 0.3) || t >= d.orientUntil) d.phase = "go";
    else return { ...cmd, goal: d.from, ...FLIGHT.hover };
  }
  return cmd;
}

/* Noticing: a reaction delay before the pointer gets the bird's attention. */
function startNotice(b: BehaviorState, t: number) {
  b.notice = { at: t + randomIn(b.random, BEHAVIOR.reaction), command: b.lastCommand };
  setState(b, "noticing", t);
}

function noticing(b: BehaviorState, body: BodyState, t: number): MotionCommand {
  const notice = b.notice!;
  if (t >= notice.at) {
    startInspect(b, body, t, 0);
    return STATES[b.state](b, body, t);
  }
  return notice.command ?? { goal: [...body.pos], ...FLIGHT.hover, gazeYaw: uToYaw(body.u) };
}

/* Inspecting: hover at a distance beside the pointer, swaying, gaze on it. */
function startInspect(b: BehaviorState, body: BodyState, t: number, caution: number) {
  const p = b.pointer.pos;
  if (!p) return startHover(b, body, t, [...body.pos]);
  const side = Math.sign(body.pos[0] - p[0]) || -facingSide(body.u);
  const [zLow, zHigh] = BEHAVIOR.inspect.depth;
  b.inspect = { side, start: t, caution, depth: clamp(body.pos[2], zLow, zHigh), goal: [...body.pos] };
  setState(b, "inspecting", t);
}

function inspecting(b: BehaviorState, body: BodyState, t: number): MotionCommand {
  const s = b.inspect!;
  const cfg = BEHAVIOR.inspect;
  const p = b.pointer.pos;
  const idle = t - b.pointer.movedAt;
  if (idle > cfg.boredom || (!p && idle > cfg.lostPointer)) {
    startHover(b, body, t, [...body.pos]);
    return hovering(b, body, t);
  }
  if (!p) return { goal: s.goal, ...FLIGHT.hover, gazeYaw: uToYaw(body.u) };
  // Cross to the pointer's other side only when it is clearly past the bird.
  if ((body.pos[0] - p[0]) * s.side < -cfg.hysteresis) s.side = -s.side;
  const caution = s.caution * (1 - smooth(0, cfg.cautionTime, t - s.start));
  const distance = cfg.distance + (cfg.cautious - cfg.distance) * caution;
  const base: Vec3 = [p[0] + s.side * distance, p[1] + cfg.drop, s.depth];
  // A pendulum sway once it has settled beside the pointer.
  const settled = 1 - smooth(0.25, 0.7, Math.hypot(body.pos[0] - base[0], body.pos[1] - base[1]));
  base[0] += cfg.sway * Math.sin((2 * Math.PI * (t - s.start)) / cfg.swayPeriod) * settled;
  s.goal = clampToBounds(base, b.layout.bounds, 0.1);
  const profile = caution > 0.3 ? FLIGHT.cautious : FLIGHT.inspect;
  return { goal: s.goal, ...profile, gaze: p, faceTravel: true };
}

/* Evading: back off and up from a pointer that rushes in, pause, come back warily. */
function startEvade(b: BehaviorState, body: BodyState, t: number) {
  const r = b.random;
  const p = b.pointer.pos;
  const cfg = BEHAVIOR.evade;
  let away: Vec3 = p ? [body.pos[0] - p[0], body.pos[1] - p[1], 0] : scale(beakFlat(body), -1);
  if (length(away) < 0.05) away = scale(beakFlat(body), -1);
  away = scale(away, 1 / length(away));
  const goal = clampToBounds(
    add(add(body.pos, scale(away, cfg.distance)), [0, cfg.lift, 0]),
    b.layout.bounds,
    0.05,
  );
  const fleeUntil = t + randomIn(r, cfg.time);
  b.evade = { goal, fleeUntil, pauseUntil: fleeUntil + randomIn(r, cfg.pause), yaw: uToYaw(body.u) };
  setState(b, "evading", t);
}

function evading(b: BehaviorState, body: BodyState, t: number): MotionCommand {
  const e = b.evade!;
  const p = b.pointer.pos;
  const gaze = p ? { gaze: p } : { gazeYaw: e.yaw };
  if (t < e.fleeUntil) return { goal: e.goal, ...FLIGHT.evade, ...gaze, tail: 1 };
  // Hold at the retreat point, braking as hard as the retreat itself.
  if (t < e.pauseUntil) {
    return { goal: e.goal, ...FLIGHT.evade, maxSpeed: FLIGHT.hover.maxSpeed, ...gaze, tail: 0.4 };
  }
  if (p && t - b.pointer.movedAt < BEHAVIOR.inspect.boredom) startInspect(b, body, t, 1);
  else startHover(b, body, t, [...body.pos]);
  return STATES[b.state](b, body, t);
}

/* Startled: a click on the bird makes it hop back and up, then carry on. */
function startStartle(b: BehaviorState, body: BodyState, t: number) {
  const r = b.random;
  const cfg = BEHAVIOR.startle;
  const distance = randomIn(r, cfg.distance);
  const back = scale(beakFlat(body), -Math.sqrt(distance * distance - cfg.lift * cfg.lift));
  const goal = clampToBounds(add(add(body.pos, back), [0, cfg.lift, 0]), b.layout.bounds, 0.05);
  b.startle = {
    goal,
    until: t + cfg.time,
    holdUntil: t + cfg.time + randomIn(r, cfg.hold),
    yaw: uToYaw(body.u),
    resume:
      b.state === "startled" && b.startle ? b.startle.resume : { state: b.state, dart: b.dart },
  };
  setState(b, "startled", t);
}

function startled(b: BehaviorState, body: BodyState, t: number): MotionCommand {
  const s = b.startle!;
  if (t < s.until) return { goal: s.goal, ...FLIGHT.startle, gazeYaw: s.yaw, tail: 1 };
  if (t < s.holdUntil) return { goal: s.goal, ...FLIGHT.hover, gazeYaw: s.yaw, tail: 0.5 };
  const { state, dart } = s.resume;
  const pointerRecent = b.pointer.pos && t - b.pointer.movedAt < BEHAVIOR.inspect.boredom;
  if (state === "darting" && dart) {
    b.dart = {
      ...dart,
      from: [...body.pos],
      phase: dart.slip ? "go" : "orient",
      orientUntil: t + BEHAVIOR.orientTimeout,
    };
    setState(b, "darting", t);
  } else if (pointerRecent && state !== "hovering") {
    startInspect(b, body, t, 1);
  } else {
    startHover(b, body, t, [...body.pos]);
  }
  return STATES[b.state](b, body, t);
}

const STATES: Record<
  BehaviorStateName,
  (b: BehaviorState, body: BodyState, t: number) => MotionCommand
> = { entering, hovering, darting, noticing, inspecting, evading, startled };
