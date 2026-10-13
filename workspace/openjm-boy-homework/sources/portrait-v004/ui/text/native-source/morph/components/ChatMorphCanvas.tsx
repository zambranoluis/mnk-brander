"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import {
  createMorphBridgeTargetSnapshot,
  createMorphParticleSnapshot,
  renderMorphFrame,
  type MorphParticleSnapshot,
  type MorphPointCache,
} from "@/features/morph/engine/renderMorphFrame";
import { createMorphBridgeFrame, getElapsedFromProgress, getTimelineProgress } from "@/features/morph/engine/orchestration";
import {
  createMorphMotionState,
  interpolateMorphMotion,
  type MorphMotionState,
} from "@/features/morph/engine/motion";
import {
  advanceReactiveMotion,
  readAudioReaction,
  resolveAudioAmount,
  type MorphAudioReaction,
} from "@/features/morph/engine/audioReaction";
import { resolveTimelineFrame, type MorphTimelineFrame } from "@/features/morph/engine/timeline";
import { MORPH_MODES, type MorphAudioFrame, type MorphMode, type MorphPreset } from "@/features/morph/types/morph";
import styles from "@/features/morph/styles/ChatMorphCanvas.module.css";

type ChatMorphCanvasProps = {
  mode?: MorphMode;
  presets: Record<MorphMode, MorphPreset>;
  className?: string;
  ariaHidden?: boolean;
  pointDensityScale?: number;
  objectScale?: number;
  pointScale?: number;
  renderTarget?: MorphRenderTarget;
  /** Supplies the playing song's analysed frame while the mode is "playing". */
  readAudioFrame?: (nowMs: number) => MorphAudioFrame | null;
};

export type MorphRenderTarget = {
  viewportRef: RefObject<HTMLElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
};

type CanvasMetrics = {
  width: number;
  height: number;
  dpr: number;
  logicalWidth: number;
  logicalHeight: number;
  originX: number;
  originY: number;
};

type ModeBridge = {
  fromFrame: MorphTimelineFrame;
  toFrame: MorphTimelineFrame;
  fromMotion: MorphMotionState;
  toMotion: MorphMotionState;
  sourceSnapshot: MorphParticleSnapshot | null;
  targetSnapshot: MorphParticleSnapshot;
  targetMode: MorphMode;
  fromAudioAmount: number;
  targetElapsed: number;
  elapsed: number;
  duration: number;
};

const MODE_TRANSITION_SECONDS = 5 / 3;
const WORKING_TRANSITION_SECONDS = 1.1;

function resolveModeTransitionSeconds(fromMode: MorphMode, toMode: MorphMode) {
  return fromMode === "working" || toMode === "working"
    ? WORKING_TRANSITION_SECONDS
    : MODE_TRANSITION_SECONDS;
}

function resolveFrameForMode(preset: MorphPreset, elapsedSeconds: number) {
  return resolveTimelineFrame(preset.params, preset.timeline, elapsedSeconds, preset.loop);
}

function getBridgeProgress(bridge: ModeBridge) {
  const rawProgress = Math.min(1, Math.max(0, bridge.elapsed / bridge.duration));
  return rawProgress * rawProgress * (3 - 2 * rawProgress);
}

function createModeRecord<T>(create: () => T) {
  return Object.fromEntries(MORPH_MODES.map((mode) => [mode, create()])) as Record<MorphMode, T>;
}

function getAudioAmount(bridge: ModeBridge | null, activeMode: MorphMode) {
  return resolveAudioAmount(activeMode, bridge && { ...bridge, progress: getBridgeProgress(bridge) });
}

export default function ChatMorphCanvas({
  mode = "standby",
  presets,
  className = "",
  ariaHidden = false,
  pointDensityScale = 1,
  objectScale = 1,
  pointScale = 1,
  renderTarget,
  readAudioFrame,
}: ChatMorphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef<CanvasMetrics>({
    width: 0,
    height: 0,
    dpr: 1,
    logicalWidth: 0,
    logicalHeight: 0,
    originX: 0,
    originY: 0,
  });
  const motionByModeRef = useRef(createModeRecord(createMorphMotionState));
  const elapsedByModeRef = useRef(createModeRecord(() => 0));
  const lastFrameTimestampRef = useRef<number | null>(null);
  const pointCacheRef = useRef<MorphPointCache>(new Map());
  const activeModeRef = useRef<MorphMode>(mode);
  const bridgeRef = useRef<ModeBridge | null>(null);
  const presetsRef = useRef(presets);
  // The bloom still forms under reduced motion; it just stops reacting.
  const prefersReducedMotion = useReducedMotion() ?? false;
  const readAudioFrameRef = useRef(readAudioFrame);
  const heldAudioFrameRef = useRef<MorphAudioFrame | null>(null);

  useEffect(() => {
    presetsRef.current = presets;
    readAudioFrameRef.current = prefersReducedMotion ? undefined : readAudioFrame;
  }, [prefersReducedMotion, presets, readAudioFrame]);

  useEffect(() => {
    const nextMode = mode ?? "standby";
    const currentMode = activeModeRef.current;

    if (currentMode === nextMode && !bridgeRef.current) {
      return;
    }

    const sourcePreset = presetsRef.current[currentMode];
    const targetPreset = presetsRef.current[nextMode];
    const sourceElapsed = elapsedByModeRef.current[currentMode];
    const currentBridge = bridgeRef.current;
    const bridgeProgress = currentBridge
      ? getBridgeProgress(currentBridge)
      : 0;
    const bridgeSourceFrame = currentBridge
      ? createMorphBridgeFrame(
          currentBridge.fromFrame,
          currentBridge.toFrame,
          bridgeProgress,
        )
      : resolveFrameForMode(sourcePreset, sourceElapsed);
    const sourceMotion = currentBridge
      ? interpolateMorphMotion(
          currentBridge.fromMotion,
          currentBridge.toMotion,
          bridgeProgress,
        )
      : motionByModeRef.current[currentMode];
    const targetMotion = motionByModeRef.current[nextMode];
    // Every mode change starts from the particle cloud that is currently on
    // screen. Rebuilding the source from the next mode's density can otherwise
    // make standby visibly rearrange before it begins to morph.
    const sourceSnapshot = createMorphParticleSnapshot({
      params: bridgeSourceFrame.params,
      time: sourceMotion.visualTime,
      pointCache: pointCacheRef.current,
      fromState: bridgeSourceFrame.fromState,
      toState: bridgeSourceFrame.toState,
      transitionProgress: bridgeSourceFrame.progress,
      sourceSnapshot: currentBridge?.sourceSnapshot,
    });
    const sourceProgress = getTimelineProgress(
      sourceElapsed,
      sourcePreset.timeline,
      sourcePreset.loop,
    );
    const targetElapsed = getElapsedFromProgress(
      targetPreset.timeline,
      bridgeRef.current ? getBridgeProgress(bridgeRef.current) : sourceProgress,
    );
    const targetFrame = resolveFrameForMode(targetPreset, targetElapsed);
    const targetSnapshot = createMorphBridgeTargetSnapshot({
      params: targetFrame.params,
      time: targetMotion.visualTime,
      pointCache: pointCacheRef.current,
      fromState: targetFrame.fromState,
      toState: targetFrame.toState,
      transitionProgress: targetFrame.progress,
      sourceSnapshot,
    });

    bridgeRef.current = {
      fromFrame: bridgeSourceFrame,
      toFrame: targetFrame,
      fromMotion: sourceMotion,
      toMotion: targetMotion,
      sourceSnapshot,
      targetSnapshot,
      targetMode: nextMode,
      fromAudioAmount: getAudioAmount(currentBridge, currentMode),
      targetElapsed,
      elapsed: 0,
      duration: resolveModeTransitionSeconds(currentMode, nextMode),
    };
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const resolveVisibleFrame = () => {
      const bridge = bridgeRef.current;

      if (bridge) {
        return createMorphBridgeFrame(
          bridge.fromFrame,
          bridge.toFrame,
          getBridgeProgress(bridge),
        );
      }

      const activeMode = activeModeRef.current;
      const preset = presetsRef.current[activeMode];
      const elapsed = elapsedByModeRef.current[activeMode];

      return resolveFrameForMode(preset, elapsed);
    };

    const resolveVisibleMotion = () => {
      const bridge = bridgeRef.current;

      if (bridge) {
        return interpolateMorphMotion(
          bridge.fromMotion,
          bridge.toMotion,
          getBridgeProgress(bridge),
        );
      }

      return motionByModeRef.current[activeModeRef.current];
    };

    const updateCanvasMetrics = () => {
      const viewport = renderTarget?.viewportRef.current ?? wrapper;
      const anchor = renderTarget?.anchorRef.current ?? wrapper;
      const viewportRect = viewport.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const width = Math.max(1, viewportRect.width);
      const height = Math.max(1, viewportRect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const metrics: CanvasMetrics = {
        width,
        height,
        dpr,
        logicalWidth: Math.max(1, anchorRect.width),
        logicalHeight: Math.max(1, anchorRect.height),
        originX: anchorRect.left - viewportRect.left + anchorRect.width / 2,
        originY: anchorRect.top - viewportRect.top + anchorRect.height / 2,
      };
      const previous = sizeRef.current;

      sizeRef.current = metrics;

      if (
        previous.width !== width ||
        previous.height !== height ||
        previous.dpr !== dpr
      ) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    const drawFrame = (
      frame = resolveVisibleFrame(),
      motion = resolveVisibleMotion(),
      audio?: MorphAudioReaction,
    ) => {
      updateCanvasMetrics();
      const {
        width,
        height,
        dpr,
        logicalWidth,
        logicalHeight,
        originX,
        originY,
      } = sizeRef.current;

      if (!width || !height) {
        return;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      renderMorphFrame({
        context,
        width,
        height,
        params: frame.params,
        time: motion.visualTime,
        pulse: motion.pulse,
        rotationX: motion.rotationX,
        rotationY: motion.rotationY,
        pointCache: pointCacheRef.current,
        fromState: frame.fromState,
        toState: frame.toState,
        transitionProgress: frame.progress,
        sourceSnapshot: bridgeRef.current?.sourceSnapshot,
        targetSnapshot: bridgeRef.current?.targetSnapshot,
        pointDensityScale,
        objectScale,
        pointScale,
        logicalWidth,
        logicalHeight,
        originX,
        originY,
        audio,
      });
    };

    const animate = (timestamp: number) => {
      const previousTimestamp = lastFrameTimestampRef.current ?? timestamp;
      const deltaSeconds = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
      lastFrameTimestampRef.current = timestamp;

      let frame: MorphTimelineFrame;
      const bridge = bridgeRef.current;
      const amount = getAudioAmount(bridge, activeModeRef.current);
      const playingTime = motionByModeRef.current.playing.visualTime;
      const audio = readAudioReaction(readAudioFrameRef.current, timestamp, amount, playingTime, heldAudioFrameRef);
      const beatPulseForce = presetsRef.current.playing.params.pulseForce;

      if (bridge) {
        bridge.elapsed += deltaSeconds;
        const progress = Math.min(1, Math.max(0, bridge.elapsed / bridge.duration));
        frame = createMorphBridgeFrame(
          bridge.fromFrame,
          bridge.toFrame,
          getBridgeProgress(bridge),
        );
        bridge.toMotion = advanceReactiveMotion(
          bridge.toMotion,
          deltaSeconds,
          bridge.toFrame.params,
          audio,
          beatPulseForce,
        );
        motionByModeRef.current[bridge.targetMode] = bridge.toMotion;

        if (progress >= 1) {
          activeModeRef.current = bridge.targetMode;
          elapsedByModeRef.current[bridge.targetMode] = bridge.targetElapsed;
          bridgeRef.current = null;
        }
      } else {
        const activeMode = activeModeRef.current;
        const preset = presetsRef.current[activeMode];
        elapsedByModeRef.current[activeMode] += deltaSeconds;
        frame = resolveFrameForMode(preset, elapsedByModeRef.current[activeMode]);
        motionByModeRef.current[activeMode] = advanceReactiveMotion(
          motionByModeRef.current[activeMode],
          deltaSeconds,
          frame.params,
          audio,
          beatPulseForce,
        );
      }

      drawFrame(frame, undefined, audio);
      frameRef.current = window.requestAnimationFrame(animate);
    };

    const pulse = () => {
      const activeMode = activeModeRef.current;
      motionByModeRef.current[activeMode] = {
        ...motionByModeRef.current[activeMode],
        pulse: presetsRef.current[activeMode].params.pulseForce,
      };
    };

    drawFrame();
    const resizeObserver = new ResizeObserver(() => drawFrame());
    resizeObserver.observe(wrapper);

    const viewport = renderTarget?.viewportRef.current;
    const anchor = renderTarget?.anchorRef.current;

    if (viewport && viewport !== wrapper) {
      resizeObserver.observe(viewport);
    }

    if (anchor && anchor !== wrapper && anchor !== viewport) {
      resizeObserver.observe(anchor);
    }
    canvas.addEventListener("pointerdown", pulse);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", pulse);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    objectScale,
    pointDensityScale,
    pointScale,
    renderTarget?.anchorRef,
    renderTarget?.viewportRef,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.orbWrap} ${renderTarget ? styles.viewportWrap : ""}`.trim()}
      aria-hidden={ariaHidden ? "true" : undefined}
      data-morph-mode={mode ?? "standby"}
    >
      <canvas
        ref={canvasRef}
        className={`${styles.canvasFrame} ${className}`}
        aria-label={ariaHidden ? undefined : "Morph visualization"}
        tabIndex={ariaHidden ? -1 : 0}
      />
    </div>
  );
}
