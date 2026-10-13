/**
 * Launch policy for the dashboard loading overlay.
 *
 * The overlay holds the dashboard from its first paint, which is the static
 * brand logo. An eligible device prepares the 3D hummingbird behind the logo;
 * if its scene is ready within the start cap, the bird replaces the logo and
 * the overlay holds for a fixed flight time, then exits once the dashboard is
 * ready. An ineligible device and every failure keep the logo (`fallback`
 * names why) and hold only until the minimum visible time has elapsed.
 *
 * Pure and clock-free: timed events carry their own timestamp (ms, one
 * monotonic clock) and `nextLoaderTimer` tells the caller which one to
 * schedule next.
 */

/** The overlay is visible at least this long, measured from eligibility. */
export const LOADER_MIN_VISIBLE_MS = 1000;
/** The flight must start within this long of the overlay becoming eligible. */
export const LOADER_START_CAP_MS = 4000;
/** Flight time the overlay holds the dashboard, measured from the flight start. */
export const LOADER_HOLD_MS = 5000;
/** How long a landed bird's slot shows the brand mark before its own content. */
export const LOADER_BRAND_MARK_HOLD_MS = 600;

export type LoaderStage =
  | "static"
  | "preparing-3d"
  | "flying"
  | "exiting"
  | "done";

/** Why the overlay keeps the static logo instead of the bird. */
type LoaderFallback =
  | "ineligible"
  | "start-cap"
  | "scene-failed"
  | "context-lost"
  | "skipped";

/**
 * The avatar slot during a landing: its content hidden while the bird flies
 * to it (`awaiting`), then the brand mark in place of any photo (`holding`).
 */
export type BrandMarkHandoff = "idle" | "awaiting" | "holding";

export type LoaderSequenceState = {
  stage: LoaderStage;
  eligibility: "unknown" | "eligible" | "ineligible";
  /** Whether the overlay is holding the dashboard back; true from the first paint. */
  holdActive: boolean;
  /** Why the logo stays instead of the bird; null while the bird is still possible. */
  fallback: LoaderFallback | null;
  /** The bird has settled at the center after its entrance. */
  arrived: boolean;
  /** Esc was pressed during the entrance; it takes effect on arrival. */
  skipRequested: boolean;
  dashboardReady: boolean;
  /** When eligibility was decided: the start of the minimum visible time. */
  startedAt: number | null;
  floorElapsed: boolean;
  preparingSince: number | null;
  flightStartedAt: number | null;
};

export type LoaderSequenceEvent =
  | { type: "eligible"; at: number }
  | { type: "ineligible"; at: number }
  | { type: "scene-ready"; at: number }
  | { type: "start-cap"; at: number }
  | { type: "floor-elapsed"; at: number }
  | { type: "scene-failed" }
  | { type: "context-lost" }
  | { type: "hold-elapsed"; at: number }
  | { type: "skip" }
  | { type: "arrived" }
  | { type: "dashboard-ready" }
  | { type: "landed" };

export type LoaderTimer = {
  type: "start-cap" | "floor-elapsed" | "hold-elapsed";
  at: number;
};

export const initialLoaderSequenceState: LoaderSequenceState = {
  stage: "static",
  eligibility: "unknown",
  holdActive: true,
  fallback: null,
  arrived: false,
  skipRequested: false,
  dashboardReady: false,
  startedAt: null,
  floorElapsed: false,
  preparingSince: null,
  flightStartedAt: null,
};

/** The logo stays; the hold lasts only until the minimum visible time. */
function fallBackToStatic(
  state: LoaderSequenceState,
  fallback: LoaderFallback,
): LoaderSequenceState {
  return {
    ...state,
    stage: "static",
    fallback,
    holdActive: state.holdActive && !state.floorElapsed,
  };
}

function releaseHold(state: LoaderSequenceState): LoaderSequenceState {
  const canExit = state.dashboardReady && state.stage === "flying";
  return { ...state, holdActive: false, stage: canExit ? "exiting" : state.stage };
}

type EventOf<T extends LoaderSequenceEvent["type"]> = Extract<
  LoaderSequenceEvent,
  { type: T }
>;

type Transitions = {
  [T in LoaderSequenceEvent["type"]]: (
    state: LoaderSequenceState,
    event: EventOf<T>,
  ) => LoaderSequenceState;
};

const isStartingFlight = (state: LoaderSequenceState) =>
  state.stage === "preparing-3d" && state.preparingSince !== null;

const preparingFor = (state: LoaderSequenceState, at: number) =>
  at - (state.preparingSince ?? at);

const transitions: Transitions = {
  eligible: (state, event) =>
    state.eligibility !== "unknown" || state.dashboardReady
      ? state
      : {
          ...state,
          stage: "preparing-3d",
          eligibility: "eligible",
          startedAt: event.at,
          preparingSince: event.at,
        },

  ineligible: (state, event) =>
    state.eligibility !== "unknown"
      ? state
      : {
          ...fallBackToStatic(state, "ineligible"),
          eligibility: "ineligible",
          startedAt: event.at,
        },

  "scene-ready": (state, event) => {
    if (!isStartingFlight(state)) return state;
    // A scene that arrives after the start cap never starts a flight.
    if (preparingFor(state, event.at) > LOADER_START_CAP_MS) {
      return fallBackToStatic(state, "start-cap");
    }
    return { ...state, stage: "flying", flightStartedAt: event.at };
  },

  "start-cap": (state, event) =>
    isStartingFlight(state) && preparingFor(state, event.at) >= LOADER_START_CAP_MS
      ? fallBackToStatic(state, "start-cap")
      : state,

  "floor-elapsed": (state, event) => {
    if (state.startedAt === null || event.at - state.startedAt < LOADER_MIN_VISIBLE_MS) {
      return state;
    }
    const elapsed = { ...state, floorElapsed: true };
    return state.stage === "static" && state.holdActive ? releaseHold(elapsed) : elapsed;
  },

  "scene-failed": (state) =>
    state.stage === "preparing-3d" || state.stage === "flying"
      ? fallBackToStatic(state, "scene-failed")
      : state,

  "context-lost": (state) => {
    if (state.stage === "exiting") return { ...state, stage: "done" };
    return state.stage === "preparing-3d" || state.stage === "flying"
      ? fallBackToStatic(state, "context-lost")
      : state;
  },

  "hold-elapsed": (state, event) =>
    state.stage === "flying" &&
    state.holdActive &&
    state.flightStartedAt !== null &&
    event.at - state.flightStartedAt >= LOADER_HOLD_MS
      ? releaseHold(state)
      : state,

  // Esc while preparing keeps the logo until the minimum visible time; during
  // the entrance it waits for the bird to settle at the center.
  skip: (state) => {
    if (state.stage === "preparing-3d") return fallBackToStatic(state, "skipped");
    if (state.stage !== "flying" || !state.holdActive) return state;
    return state.arrived ? releaseHold(state) : { ...state, skipRequested: true };
  },

  arrived: (state) => {
    if (state.stage !== "flying" || state.arrived) return state;
    const arrived = { ...state, arrived: true };
    return state.skipRequested && state.holdActive ? releaseHold(arrived) : arrived;
  },

  "dashboard-ready": (state) => {
    if (state.dashboardReady) return state;
    const canExit = state.stage === "flying" && !state.holdActive;
    return {
      ...state,
      dashboardReady: true,
      stage: canExit ? "exiting" : state.stage,
    };
  },

  landed: (state) =>
    state.stage === "exiting" ? { ...state, stage: "done" } : state,
};

export function nextLoaderSequenceState(
  state: LoaderSequenceState,
  event: LoaderSequenceEvent,
): LoaderSequenceState {
  const transition = transitions[event.type] as (
    state: LoaderSequenceState,
    event: LoaderSequenceEvent,
  ) => LoaderSequenceState;
  return transition(state, event);
}

/** The next timed event the caller should schedule, if any. */
export function nextLoaderTimer(state: LoaderSequenceState): LoaderTimer | null {
  if (state.stage === "preparing-3d" && state.preparingSince !== null) {
    return { type: "start-cap", at: state.preparingSince + LOADER_START_CAP_MS };
  }

  if (state.stage === "static" && state.holdActive && state.startedAt !== null) {
    return { type: "floor-elapsed", at: state.startedAt + LOADER_MIN_VISIBLE_MS };
  }

  if (state.stage === "flying" && state.holdActive && state.flightStartedAt !== null) {
    return { type: "hold-elapsed", at: state.flightStartedAt + LOADER_HOLD_MS };
  }

  return null;
}
