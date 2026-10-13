/**
 * Body layer of the loader hummingbird: a thrust-limited point mass, an
 * attitude derived from the forces on it, and the heading controller that
 * keeps the bird from ever facing the viewer.
 *
 * Pure math over plain tuples; no three.js. Axes: +x right, +y up, +z toward
 * the camera. The beak is the model's +X, so at yaw ψ it points along
 * (cos ψ, 0, −sin ψ). The GLB's rest pose is the upright hover attitude:
 * pitch 0 is hovering, negative pitch tips the body forward, positive leans
 * it back.
 *
 * The constants are the approved tuning from the loader preview
 * (workspace/dashboard-3d-loader/preview/hummingbird-body.js).
 */

export type Vec3 = [number, number, number];

/** Returns a number in [0, 1), like Math.random. Injected so tests can seed it. */
export type RandomSource = () => number;

const BODY = {
  /** 1/s, light linear drag. */
  drag: 0.6,
  /** 1/s, how hard thrust corrects a velocity error. */
  velocityGain: 6,
  /** 1/s, station keeping close to the goal. */
  positionGain: 5,
  /** units/s², smooth disturbance the thrust keeps correcting (the hover bob). */
  gust: 1.2,
  /** Noise knots per second. */
  gustRate: 0.8,
  /** units/s², stand-in weight for the wing-effort calculation. */
  gravity: 12,
  /** Share of the hover effort saved in fast forward flight. */
  cruiseRelief: 0.35,
};

export const ATTITUDE = {
  /** Body tipped forward at full cruise speed. */
  cruisePitch: -0.55,
  /** Body leaning back in backward flight. */
  backPitch: 0.2,
  /** rad per unit/s² along the heading: speeding up tips the nose down, braking lifts it. */
  accelPitch: 0.045,
  /** rad per unit/s of climb. */
  climbPitch: 0.06,
  /** rad per unit/s² of sideways acceleration (the thrust leans into it). */
  bankRoll: 0.05,
  pitchMin: -0.75,
  pitchMax: 0.45,
  rollMax: 0.55,
  /** rad/s, natural frequency of the attitude springs (critically damped). */
  rate: 13,
  tailRate: 24,
  /** rad of tail depression at a full flare. */
  tailAngle: 0.55,
};

const HEADING = {
  /** The beak points at most 30° toward the viewer, in the world and from the camera. */
  maxShare: 0.5,
  /** Steady headings point at most ~37° away from the viewer. */
  minShare: -0.6,
  /** Above this sideways speed the bird faces where it is going. */
  travelSpeed: 1.2,
  /** A heading error above ~40° at low speed is a quick pivot, not a slow turn. */
  pivotAngle: 0.7,
  pivotTime: [0.18, 0.25] as const,
  /** rad/s, natural frequency of the heading spring. */
  rate: 10,
  /** rad/s, cap on the spring's turn rate. */
  maxRate: 6,
  /** Gazes this close to straight ahead or behind keep the current side. */
  sideDeadband: 0.35,
  /** Closer gaze points are ignored. */
  gazeMinDistance: 0.6,
  camera: [0, 0, 9] as Vec3,
};

const TAU = Math.PI * 2;
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const clamp01 = (x: number) => clamp(x, 0, 1);
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const minimumJerk = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (10 + t * (6 * t - 15));
};
const minimumJerkRate = (x: number) => {
  const t = clamp01(x);
  return 30 * t * t * (1 - t) * (1 - t);
};
const mod = (x: number, m: number) => ((x % m) + m) % m;
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export const randomIn = (random: RandomSource, [a, b]: readonly [number, number]) =>
  a + (b - a) * random();

type Noise = (x: number) => number;

/** Smooth value noise in [−1, 1] with C2-continuous interpolation between random knots. */
function smoothNoise(random: RandomSource): Noise {
  const knots = Array.from({ length: 64 }, () => random() * 2 - 1);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const s = f * f * f * (f * (f * 6 - 15) + 10);
    const a = knots[mod(i, 64)];
    const b = knots[mod(i + 1, 64)];
    return a + (b - a) * s;
  };
}

type Spring = { x: number; v: number };

function spring(state: Spring, target: number, rate: number, dt: number) {
  state.v += (rate * rate * (target - state.x) - 2 * rate * state.v) * dt;
  state.x += state.v * dt;
}

/*
 * Heading lives in u = ψ + π/2, where u = 0 faces the camera. The two
 * profile headings sit at π/2 (right) and 3π/2 (left), and "away from the
 * camera" at π, so a linear turn in u between two allowed headings always
 * passes through the back.
 */
const yawToU = (yaw: number) => mod(yaw + Math.PI / 2, TAU);
export const uToYaw = (u: number) => u - Math.PI / 2;

type HeadingLimits = { frontLow: number; frontHigh: number; rear: number };

/**
 * The allowed headings at a position: the frontal arc (toward the camera, in
 * the world or as seen from the camera) is never entered; the rear arc is
 * excluded only for steady targets.
 */
function headingLimits(pos: Vec3): HeadingLimits {
  const c = sub(HEADING.camera, pos);
  const horizontal = Math.hypot(c[0], c[2]);
  const world = Math.acos(HEADING.maxShare);
  const view = Math.acos(Math.min(1, (HEADING.maxShare * length(c)) / horizontal));
  const toCamera = Math.atan2(c[0], c[2]);
  return {
    frontLow: Math.min(-world, toCamera - view),
    frontHigh: Math.max(world, toCamera + view),
    rear: Math.PI - Math.acos(HEADING.minShare),
  };
}

/** 1 = facing right, −1 = facing left. */
export const facingSide = (u: number) => (u < Math.PI ? 1 : -1);

function projectHeading(target: number, current: number, limits: HeadingLimits) {
  let u = mod(target, TAU);
  const lateral = Math.sin(u);
  const side =
    Math.abs(lateral) < HEADING.sideDeadband ? facingSide(current) : Math.sign(lateral);
  if (side > 0) {
    if (u > 1.5 * Math.PI) u -= TAU;
    return clamp(u, limits.frontHigh, Math.PI - limits.rear);
  }
  if (u < 0.5 * Math.PI) u += TAU;
  return clamp(u, Math.PI + limits.rear, TAU + limits.frontLow);
}

const beakOf = (yaw: number, pitch = 0): Vec3 => [
  Math.cos(pitch) * Math.cos(yaw),
  Math.sin(pitch),
  -Math.cos(pitch) * Math.sin(yaw),
];

/** Share of the beak pointing at the viewer: in the world (+z) and as seen from the camera. */
export function towardCamera(pos: Vec3, yaw: number, pitch = 0) {
  const beak = beakOf(yaw, pitch);
  const c = sub(HEADING.camera, pos);
  return { world: beak[2], view: dot(beak, c) / length(c) };
}

const yawToward = (from: Vec3, to: Vec3) => Math.atan2(-(to[2] - from[2]), to[0] - from[0]);

/** Cruise speed, thrust limit and braking deceleration (units/s, units/s²). */
export type FlightProfile = {
  maxSpeed: number;
  accel: number;
  brake: number;
  /** Position and velocity gains, when they differ from BODY's. */
  gains?: readonly [number, number];
};

/** Where the bird looks and how its tail moves, for one step. */
export type HeadingCommand = {
  /** Face the travel direction in fast forward flight. */
  faceTravel?: boolean;
  /** A heading to hold, as a yaw. */
  gazeYaw?: number;
  /** A point to look at. */
  gaze?: Vec3;
  /** Pivot quickly toward the target heading even at speed. */
  pivot?: boolean;
  /** Extra tail depression cue, 0–1. */
  tail?: number;
};

/** What the behavior layer asks of the body for one step. */
export type MotionCommand = HeadingCommand & FlightProfile & { goal: Vec3 };

export type BodyState = {
  pos: Vec3;
  vel: Vec3;
  acc: Vec3;
  thrust: Vec3;
  u: number;
  turnRate: number;
  pivot: { from: number; to: number; start: number; duration: number } | null;
  targetU: number;
  pitch: Spring;
  roll: Spring;
  tail: Spring;
  effort: number;
  noise: [Noise, Noise, Noise];
};

export type BodyPose = {
  position: Vec3;
  yaw: number;
  pitch: number;
  roll: number;
  /** Tail depression and fan, 0–1. */
  tail: number;
  /** Wing effort relative to hovering; 1 is a plain hover. */
  effort: number;
};

export function createBody(pos: Vec3, vel: Vec3, yaw: number, random: RandomSource): BodyState {
  return {
    pos: [...pos],
    vel: [...vel],
    acc: [0, 0, 0],
    thrust: [0, 0, 0],
    u: yawToU(yaw),
    turnRate: 0,
    pivot: null,
    targetU: yawToU(yaw),
    pitch: { x: 0, v: 0 },
    roll: { x: 0, v: 0 },
    tail: { x: 0, v: 0 },
    effort: 1,
    noise: [smoothNoise(random), smoothNoise(random), smoothNoise(random)],
  };
}

/**
 * Thrust toward the goal: cruise at maxSpeed, brake at a constant `brake`
 * deceleration into the goal and hold station with a proportional gain;
 * thrust is capped at `accel`.
 */
export function integrateBody(body: BodyState, cmd: MotionCommand, t: number, dt: number) {
  const toGoal = sub(cmd.goal, body.pos);
  const dist = length(toGoal);
  const gains = cmd.gains ?? [BODY.positionGain, BODY.velocityGain];
  // Brake against the distance still left once the velocity loop has caught
  // up, so arrivals do not overshoot.
  const along = dist > 1e-6 ? dot(body.vel, toGoal) / dist : 0;
  const left = Math.max(0, dist - Math.max(0, along) / gains[1]);
  const speed = Math.min(cmd.maxSpeed, Math.sqrt(2 * cmd.brake * left), gains[0] * left);
  const wanted = dist > 1e-6 ? scale(toGoal, speed / dist) : ([0, 0, 0] as Vec3);
  let thrust = add(scale(sub(wanted, body.vel), gains[1]), scale(body.vel, BODY.drag));
  const magnitude = length(thrust);
  if (magnitude > cmd.accel) thrust = scale(thrust, cmd.accel / magnitude);
  const k = t * BODY.gustRate;
  const gust: Vec3 = [
    body.noise[0](k) * BODY.gust,
    body.noise[1](k + 17) * BODY.gust * 0.8,
    body.noise[2](k + 31) * BODY.gust * 0.5,
  ];
  const acc = sub(add(thrust, gust), scale(body.vel, BODY.drag));
  body.vel = add(body.vel, scale(acc, dt));
  body.pos = add(body.pos, scale(body.vel, dt));
  body.acc = acc;
  body.thrust = thrust;
}

/** Exits follow a fixed trajectory; the body only takes its state and derives the attitude from it. */
export function followTrajectory(body: BodyState, pos: Vec3, vel: Vec3, acc: Vec3) {
  body.pos = [...pos];
  body.vel = [...vel];
  body.acc = [...acc];
  body.thrust = add(acc, scale(vel, BODY.drag));
}

function headingTarget(body: BodyState, cmd: HeadingCommand) {
  const horizontal = Math.hypot(body.vel[0], body.vel[2]);
  const travel = Math.atan2(-body.vel[2], body.vel[0]);
  let gaze: number | null = null;
  if (cmd.gazeYaw !== undefined) gaze = cmd.gazeYaw;
  // A gaze point right beside the bird has no meaningful direction; keep the current heading.
  else if (
    cmd.gaze &&
    Math.hypot(cmd.gaze[0] - body.pos[0], cmd.gaze[2] - body.pos[2]) > HEADING.gazeMinDistance
  ) {
    gaze = yawToward(body.pos, cmd.gaze);
  }
  // Fast forward flight faces the travel direction; flying backward away from the gaze does not.
  const forward = gaze === null || Math.cos(travel - gaze) > 0;
  if (cmd.faceTravel && horizontal > HEADING.travelSpeed && forward) return yawToU(travel);
  return gaze === null ? body.u : yawToU(gaze);
}

export function headingError(body: BodyState, cmd: HeadingCommand) {
  const target = projectHeading(headingTarget(body, cmd), body.u, headingLimits(body.pos));
  return Math.abs(target - body.u);
}

function steerHeading(body: BodyState, cmd: HeadingCommand, t: number, dt: number) {
  const limits = headingLimits(body.pos);
  const target = projectHeading(headingTarget(body, cmd), body.u, limits);
  body.targetU = target;
  const slow = Math.hypot(body.vel[0], body.vel[2]) < HEADING.travelSpeed * 1.25;
  const error = target - body.u;
  if (!body.pivot && (slow || cmd.pivot) && Math.abs(error) > HEADING.pivotAngle) {
    const [short, long] = HEADING.pivotTime;
    const share = clamp01((Math.abs(error) - HEADING.pivotAngle) / (Math.PI - HEADING.pivotAngle));
    body.pivot = { from: body.u, to: target, start: t, duration: short + (long - short) * share };
  }
  if (body.pivot) {
    const p = body.pivot;
    const x = (t - p.start) / p.duration;
    body.u = p.from + (p.to - p.from) * minimumJerk(x);
    body.turnRate = ((p.to - p.from) * minimumJerkRate(x)) / p.duration;
    if (x >= 1) body.pivot = null;
  } else {
    body.turnRate += (HEADING.rate * HEADING.rate * error - 2 * HEADING.rate * body.turnRate) * dt;
    body.turnRate = clamp(body.turnRate, -HEADING.maxRate, HEADING.maxRate);
    body.u += body.turnRate * dt;
  }
  // Never inside the frontal arc, even when the arc itself moves with the bird.
  const low = limits.frontHigh;
  const high = TAU + limits.frontLow;
  if (body.u < low || body.u > high) {
    body.u = clamp(body.u, low, high);
    body.turnRate = 0;
  }
}

/** Attitude is the thrust leaning into the acceleration, on top of the speed-dependent body angle. */
export function orientBody(body: BodyState, cmd: HeadingCommand, t: number, dt: number) {
  steerHeading(body, cmd, t, dt);
  const yaw = uToYaw(body.u);
  const forward: Vec3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const right: Vec3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  const vForward = dot(body.vel, forward);
  const aForward = dot(body.acc, forward);
  const aRight = dot(body.acc, right);
  const cruise =
    ATTITUDE.cruisePitch * smooth(0.3, 3.2, vForward) +
    ATTITUDE.backPitch * smooth(0.2, 2, -vForward);
  const pitch = clamp(
    cruise - ATTITUDE.accelPitch * aForward + ATTITUDE.climbPitch * clamp(body.vel[1], -2, 2),
    ATTITUDE.pitchMin,
    ATTITUDE.pitchMax,
  );
  const roll = clamp(ATTITUDE.bankRoll * aRight, -ATTITUDE.rollMax, ATTITUDE.rollMax);
  spring(body.pitch, pitch, ATTITUDE.rate, dt);
  spring(body.roll, roll, ATTITUDE.rate, dt);
  // The tail depresses and fans when braking or leaning back, and on the behavior's cues.
  const tail = clamp01(
    (cmd.tail ?? 0) + 0.05 * Math.max(0, -aForward) + 0.8 * Math.max(0, body.pitch.x),
  );
  spring(body.tail, tail, ATTITUDE.tailRate, dt);
  // Wing effort: thrust against weight, with the induced-power relief of fast forward flight.
  const relief = BODY.cruiseRelief * smooth(0.5, 3, Math.hypot(body.vel[0], body.vel[2]));
  body.effort = length(add(body.thrust, [0, BODY.gravity * (1 - relief), 0])) / BODY.gravity;
}

export function bodyPose(body: BodyState): BodyPose {
  return {
    position: [...body.pos],
    yaw: uToYaw(body.u),
    pitch: body.pitch.x,
    roll: body.roll.x,
    tail: clamp01(body.tail.x),
    effort: body.effort,
  };
}
