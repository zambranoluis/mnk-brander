"use client";

import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  type RefObject,
} from "react";
import type {
  HummingbirdExit,
  HummingbirdScene,
  LandingSlot,
} from "@/features/dashboard/components/loader/hummingbirdScene";
import {
  initialLoaderSequenceState,
  nextLoaderSequenceState,
  nextLoaderTimer,
  type BrandMarkHandoff,
  type LoaderSequenceEvent,
  type LoaderStage,
  type LoaderTimer,
} from "@/features/dashboard/utils/dashboardLoaderSequence";
import { HUMMINGBIRD_MODEL_URL } from "@/features/dashboard/utils/hummingbirdAssets";

const LANDING_TARGET_ATTRIBUTE = "data-loader-landing-target";

type Dispatch = (event: LoaderSequenceEvent) => void;
type SceneRef = RefObject<HummingbirdScene | null>;

type UseDashboardLoaderSequenceParams = {
  isDashboardReady: boolean;
  onHoldChange: (isActive: boolean) => void;
  onStageChange: (stage: LoaderStage) => void;
  onHandoffChange: (handoff: BrandMarkHandoff) => void;
};

function isElementShown(element: Element, viewport: DOMRect) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (
    rect.right <= viewport.left ||
    rect.left >= viewport.right ||
    rect.bottom <= viewport.top ||
    rect.top >= viewport.bottom
  ) {
    return false;
  }
  return typeof element.checkVisibility === "function"
    ? element.checkVisibility({ visibilityProperty: true })
    : true;
}

/** The first rendered, on-screen avatar slot, measured relative to the canvas. */
function resolveExit(canvas: HTMLCanvasElement): HummingbirdExit {
  const viewport = canvas.getBoundingClientRect();
  const target = Array.from(
    document.querySelectorAll(`[${LANDING_TARGET_ATTRIBUTE}]`),
  ).find((element) => isElementShown(element, viewport));

  if (!target) return { kind: "fly-past" };

  return {
    kind: "landing",
    measure: (): LandingSlot | null => {
      if (!target.isConnected) return null;
      const origin = canvas.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return {
        x: rect.left - origin.left + rect.width / 2,
        y: rect.top - origin.top + rect.height / 2,
        height: rect.height,
      };
    },
  };
}

async function fetchModel() {
  // Same-origin and credentials as the layout's preload, so it reuses that download.
  const response = await fetch(HUMMINGBIRD_MODEL_URL);
  if (!response.ok) throw new Error(`Hummingbird model: HTTP ${response.status}`);
  return response.arrayBuffer();
}

/**
 * Loads the scene once, on the first preparing stage, and reports the
 * outcome. The three.js chunk and the model download run in parallel.
 */
function useLoaderSceneLoading(
  isPreparing: boolean,
  refs: {
    overlayRef: RefObject<HTMLDivElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    sceneRef: SceneRef;
    stageRef: RefObject<LoaderStage>;
  },
  dispatch: Dispatch,
) {
  const hasStartedRef = useRef(false);
  const { overlayRef, canvasRef, sceneRef, stageRef } = refs;

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!isPreparing || hasStartedRef.current) return;
    if (!canvas || !overlay) {
      dispatch({ type: "scene-failed" });
      return;
    }
    hasStartedRef.current = true;

    Promise.all([
      import("@/features/dashboard/components/loader/hummingbirdScene"),
      fetchModel(),
    ])
      .then(([{ createHummingbirdScene }, model]) =>
        createHummingbirdScene({
          canvas,
          model,
          onContextLost: () => dispatch({ type: "context-lost" }),
        }),
      )
      .then((scene) => {
        // The start cap may have passed, Esc may have skipped the bird, or the
        // overlay unmounted, meanwhile.
        if (stageRef.current !== "preparing-3d") {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        scene.resize(overlay.clientWidth, overlay.clientHeight);
        dispatch({ type: "scene-ready", at: performance.now() });
      })
      .catch(() => {
        dispatch({ type: "scene-failed" });
      });
  }, [canvasRef, dispatch, isPreparing, overlayRef, sceneRef, stageRef]);
}

/** Runs the scene every frame while the bird is shown, pausing while hidden. */
function useLoaderFrameLoop(
  isAnimating: boolean,
  overlayRef: RefObject<HTMLDivElement | null>,
  sceneRef: SceneRef,
  dispatch: Dispatch,
  onHandoffChange: (handoff: BrandMarkHandoff) => void,
) {
  useEffect(() => {
    const overlay = overlayRef.current;
    const scene = sceneRef.current;
    if (!isAnimating || !overlay || !scene) return;

    const observer = new ResizeObserver(() => {
      scene.resize(overlay.clientWidth, overlay.clientHeight);
    });
    observer.observe(overlay);

    let frameId = 0;
    let last = performance.now();
    let hasArrived = false;
    let hasTouchedDown = false;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frameId = window.requestAnimationFrame(tick);
      if (document.hidden) return;

      const frame = scene.update(dt);
      overlay.style.setProperty("--loader-bird-x", `${frame.bird.x}px`);
      overlay.style.setProperty("--loader-bird-y", `${frame.bird.y}px`);
      overlay.style.setProperty("--loader-canvas-opacity", `${frame.canvasOpacity}`);
      overlay.style.setProperty("--loader-bird-presence", `${frame.presence}`);

      if (frame.arrived && !hasArrived) {
        hasArrived = true;
        dispatch({ type: "arrived" });
      }
      if (frame.touchedDown && !hasTouchedDown) {
        hasTouchedDown = true;
        onHandoffChange("holding");
      }
      if (frame.exited) {
        window.cancelAnimationFrame(frameId);
        dispatch({ type: "landed" });
      }
    };
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [dispatch, isAnimating, onHandoffChange, overlayRef, sceneRef]);
}

/** Pointer play while flying: the bird notices moves and taps, and a click on it startles it. */
function useLoaderPointerPlay(
  isFlying: boolean,
  overlayRef: RefObject<HTMLDivElement | null>,
  sceneRef: SceneRef,
) {
  useEffect(() => {
    const overlay = overlayRef.current;
    const scene = sceneRef.current;
    if (!isFlying || !overlay || !scene) return;

    const toLocal = (event: MouseEvent) => {
      const rect = overlay.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top] as const;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        scene.setPointer(...toLocal(event));
      }
    };
    const handlePointerDown = (event: PointerEvent) => scene.setPointer(...toLocal(event));
    const handlePointerLeave = () => scene.clearPointer();
    const handleClick = (event: MouseEvent) => scene.poke(...toLocal(event));

    overlay.addEventListener("pointermove", handlePointerMove);
    overlay.addEventListener("pointerdown", handlePointerDown);
    overlay.addEventListener("pointerleave", handlePointerLeave);
    overlay.addEventListener("click", handleClick);
    return () => {
      overlay.removeEventListener("pointermove", handlePointerMove);
      overlay.removeEventListener("pointerdown", handlePointerDown);
      overlay.removeEventListener("pointerleave", handlePointerLeave);
      overlay.removeEventListener("click", handleClick);
    };
  }, [isFlying, overlayRef, sceneRef]);
}

/** The minimum visible time, the start cap and the flight hold are wall-clock product timing. */
function useLoaderTimer(timer: LoaderTimer | null, dispatch: Dispatch) {
  const timerType = timer?.type;
  const timerAt = timer?.at;

  useEffect(() => {
    if (!timerType || timerAt === undefined) return;
    const timeoutId = window.setTimeout(() => {
      dispatch({ type: timerType, at: Math.max(performance.now(), timerAt) });
    }, Math.max(0, timerAt - performance.now()));
    return () => window.clearTimeout(timeoutId);
  }, [dispatch, timerAt, timerType]);
}

/** Starts the exit toward the landing slot and releases the renderer when the bird is gone. */
function useLoaderSceneLifetime(
  stage: LoaderStage,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  sceneRef: SceneRef,
  onHandoffChange: (handoff: BrandMarkHandoff) => void,
) {
  const hasStartedExitRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (stage !== "exiting" || !canvas || !scene || hasStartedExitRef.current) return;
    hasStartedExitRef.current = true;
    const exit = resolveExit(canvas);
    scene.startExit(exit);
    if (exit.kind === "landing") onHandoffChange("awaiting");
  }, [canvasRef, onHandoffChange, sceneRef, stage]);

  useEffect(() => {
    if (stage !== "static" && stage !== "done") return;
    sceneRef.current?.dispose();
    sceneRef.current = null;
  }, [sceneRef, stage]);

  useEffect(
    () => () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    },
    [sceneRef],
  );
}

/**
 * Drives the loading overlay: device eligibility, the lazily loaded scene,
 * the minimum visible time, the start cap and the flight hold, the frame
 * loop, pointer play and the exit into the avatar slot. The launch policy lives in
 * dashboardLoaderSequence.
 */
export function useDashboardLoaderSequence({
  isDashboardReady,
  onHoldChange,
  onStageChange,
  onHandoffChange,
}: UseDashboardLoaderSequenceParams) {
  const [state, dispatch] = useReducer(nextLoaderSequenceState, initialLoaderSequenceState);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HummingbirdScene | null>(null);
  const stageRef = useRef<LoaderStage>(state.stage);
  const { stage, holdActive } = state;

  // Reported before paint, so the workspace unmounts the overlay before a
  // `done` frame is ever painted.
  useLayoutEffect(() => {
    stageRef.current = stage;
    onStageChange(stage);
  }, [onStageChange, stage]);

  useEffect(() => onHoldChange(holdActive), [holdActive, onHoldChange]);
  useEffect(() => () => onHoldChange(false), [onHoldChange]);

  // Decided after mount: server rendering and the first paint are the static
  // logo, which stays until the bird replaces it or the hold is released.
  useEffect(() => {
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasWebGL = typeof window.WebGLRenderingContext !== "undefined";
    const at = performance.now();
    dispatch(
      prefersReducedMotion || !hasWebGL
        ? { type: "ineligible", at }
        : { type: "eligible", at },
    );
  }, []);

  useEffect(() => {
    if (isDashboardReady) dispatch({ type: "dashboard-ready" });
  }, [isDashboardReady]);

  useLoaderTimer(nextLoaderTimer(state), dispatch);

  useLoaderSceneLoading(
    stage === "preparing-3d",
    { overlayRef, canvasRef, sceneRef, stageRef },
    dispatch,
  );
  useLoaderFrameLoop(
    stage === "flying" || stage === "exiting",
    overlayRef,
    sceneRef,
    dispatch,
    onHandoffChange,
  );
  useLoaderPointerPlay(stage === "flying", overlayRef, sceneRef);

  useLoaderSceneLifetime(stage, canvasRef, sceneRef, onHandoffChange);

  // Esc ends the hold early, once the bird has settled; it never reveals the
  // dashboard before it is ready.
  useEffect(() => {
    if (!holdActive) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch({ type: "skip" });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [holdActive]);

  return {
    stage,
    fallback: state.fallback,
    isAwaitingData: stage === "flying" && !holdActive && !state.dashboardReady,
    hasArrived: state.arrived,
    overlayRef,
    canvasRef,
  };
}
