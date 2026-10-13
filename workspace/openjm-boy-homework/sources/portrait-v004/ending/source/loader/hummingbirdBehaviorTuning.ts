/**
 * Tuning of the loader hummingbird's behavior: the flight profiles each
 * behavior state flies with, and the timing and distances of the states.
 * The approved values from the loader preview
 * (workspace/dashboard-3d-loader/preview/hummingbird-behavior.js).
 */

import type { FlightProfile } from "./hummingbirdBody";

/** Cruise speed, thrust limit and braking deceleration (units/s, units/s²) per state. */
export const FLIGHT = {
  entering: { maxSpeed: 4.4, accel: 10, brake: 5.2 },
  dart: { maxSpeed: 3.4, accel: 8, brake: 4.2 },
  slip: { maxSpeed: 1.1, accel: 4, brake: 3 },
  hover: { maxSpeed: 1.2, accel: 5, brake: 3 },
  inspect: { maxSpeed: 2.6, accel: 7, brake: 4 },
  cautious: { maxSpeed: 1.3, accel: 4, brake: 3 },
  evade: { maxSpeed: 5, accel: 22, brake: 12, gains: [8, 14] },
  startle: { maxSpeed: 6, accel: 40, brake: 22, gains: [14, 22] },
} satisfies Record<string, FlightProfile>;

export const BEHAVIOR = {
  arrival: { distance: 0.15, speed: 0.3 },
  /** Hovering heading: profile, turned this far toward the viewer. */
  profileTurn: 0.2,
  hoverTime: [0.8, 2.2],
  scanOffset: 0.35,
  flick: { time: 0.18, strength: 0.7 },
  probe: { chance: 0.4, reach: 0.12, time: 0.36 },
  dart: [1.2, 3.5],
  /** |dz| ≤ 0.6·|dx|: darts stay mostly lateral. */
  dartDepth: 0.6,
  slip: [0.4, 0.8],
  slipChance: 0.25,
  flowerDepth: [-1.4, 0.5],
  flowerMargin: 0.15,
  orientTimeout: 0.6,
  reaction: [0.2, 0.35],
  inspect: {
    distance: 1.3,
    cautious: 1.8,
    cautionTime: 1.6,
    hysteresis: 0.5,
    drop: -0.1,
    sway: 0.15,
    swayPeriod: 1.2,
    boredom: 3.0,
    lostPointer: 1.0,
    depth: [-0.8, 0.5],
  },
  rush: { speed: 3.0, radius: 1.2, personalSpace: 0.55, creep: 0.3, recent: 0.3, smoothing: 0.06 },
  evade: { distance: 0.8, lift: 0.3, time: [0.3, 0.4], pause: [0.6, 1.0] },
  startle: { distance: [0.5, 0.7], lift: 0.28, time: 0.25, hold: [0.4, 0.8] },
} as const;
