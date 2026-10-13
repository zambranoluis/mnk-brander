"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { imageAspectRatio } from "@/features/chat/utils/imageAspectRatio";
import { paintImagePlaceholderBackdrop } from "@/features/chat/utils/imagePlaceholderBackdrop";
import {
  applySortingStep,
  shuffleOrder,
  sortingSteps,
  type SortingAlgorithm,
} from "@/features/chat/utils/imagePlaceholderSorting";
import styles from "@/features/chat/styles/ChatImageGenerationPlaceholder.module.css";

type ChatImageGenerationPlaceholderProps = {
  label: string;
  size: string | null;
};

type Strip = { key: number; element: HTMLElement };

const ALGORITHM_ORDER: SortingAlgorithm[] = ["bubble", "merge", "quick"];

// Milliseconds. `compare` holds a marked pair; `move` drives the strip
// transition for a swap or for a merged run.
const ALGORITHM_TIMINGS: Record<SortingAlgorithm, { compare: number; move: number }> = {
  bubble: { compare: 10, move: 42 },
  merge: { compare: 16, move: 190 },
  quick: { compare: 24, move: 74 },
};

const SCRAMBLE_MOVE_MS = 560;
const SCRAMBLE_SETTLE_MS = 600;
const VEIL_RELEASE_MS = 110;
const COMPLETE_HOLD_MS = 860;
const CYCLE_GAP_MS = 120;
const MOVE_TAIL_MS = 8;

// Keeps a strip readable at any frame width instead of switching on one breakpoint.
const TARGET_STRIP_WIDTH = 20;
const MIN_STRIP_COUNT = 10;
const MAX_STRIP_COUNT = 20;

function stripCountFor(bandWidth: number) {
  if (bandWidth <= 0) return MAX_STRIP_COUNT;
  const count = Math.round(bandWidth / TARGET_STRIP_WIDTH);
  return Math.min(MAX_STRIP_COUNT, Math.max(MIN_STRIP_COUNT, count));
}

function aspectRatioValue(aspectRatio: string) {
  const [width, height] = aspectRatio.split("/").map((part) => Number(part.trim()));
  return width > 0 && height > 0 ? width / height : 1;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return prefersReducedMotion;
}

export default function ChatImageGenerationPlaceholder({
  label,
  size,
}: ChatImageGenerationPlaceholderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stripsRef = useRef<HTMLDivElement | null>(null);
  const rangeRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const aspectRatio = imageAspectRatio(size);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const stripsRoot = stripsRef.current;
    const rangeNode = rangeRef.current;
    const veil = veilRef.current;
    if (!root || !stage || !stripsRoot || !rangeNode || !veil) return;

    let disposed = false;
    let runToken = 0;
    let strips: Strip[] = [];
    let arrangement: Strip[] = [];
    let stripWidth = 0;

    const timers = new Set<number>();
    const resumeWaiters = new Set<() => void>();
    let isPageVisible = document.visibilityState === "visible";
    let isOnScreen = false;

    const sleep = (duration: number) =>
      new Promise<void>((resolve) => {
        if (duration <= 0) {
          resolve();
          return;
        }

        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, duration);
        timers.add(id);
      });

    // DESIGN.md requires continuous animation to pause while hidden or offscreen.
    const canPlay = () => isPageVisible && isOnScreen;
    const waitUntilPlayable = () =>
      canPlay()
        ? Promise.resolve()
        : new Promise<void>((resolve) => resumeWaiters.add(resolve));

    const releaseWaiters = () => {
      const waiters = [...resumeWaiters];
      resumeWaiters.clear();
      for (const resolve of waiters) resolve();
    };

    const syncPlayback = () => {
      if (canPlay() || disposed) releaseWaiters();
    };

    const setPhase = (phase: "scrambling" | "sorting" | "complete") => {
      stage.dataset.phase = phase;
      root.dataset.phase = phase;
    };

    const setPosition = (strip: Strip, slot: number, duration: number) => {
      strip.element.style.setProperty("--move", `${duration}ms`);
      strip.element.style.transform = `translate3d(${slot * stripWidth}px, 0, 0)`;
    };

    const clearMarks = () => {
      for (const strip of strips) delete strip.element.dataset.mark;
      rangeNode.dataset.active = "false";
    };

    const markPair = (left: number, right: number) => {
      for (const strip of strips) delete strip.element.dataset.mark;
      if (arrangement[left]) arrangement[left].element.dataset.mark = "compare";
      if (arrangement[right]) arrangement[right].element.dataset.mark = "compare";
    };

    const markPivot = (index: number, pivot: number) => {
      for (const strip of strips) delete strip.element.dataset.mark;
      if (arrangement[index]) arrangement[index].element.dataset.mark = "compare";
      if (arrangement[pivot]) arrangement[pivot].element.dataset.mark = "pivot";
    };

    const showRange = (left: number, right: number) => {
      rangeNode.style.left = `${left * stripWidth}px`;
      rangeNode.style.width = `${(right - left + 1) * stripWidth}px`;
      rangeNode.dataset.active = "true";
    };

    const buildStrips = (count: number) => {
      stripsRoot.replaceChildren();
      strips = Array.from({ length: count }, (_, key) => {
        const element = document.createElement("i");
        element.className = styles.strip;
        stripsRoot.append(element);
        return { key, element };
      });
      arrangement = [...strips];
    };

    const layout = () => {
      const { width, height } = stripsRoot.getBoundingClientRect();
      if (width <= 0 || height <= 0) return false;

      const desiredCount = stripCountFor(width);
      const rebuilt = strips.length !== desiredCount;
      if (rebuilt) buildStrips(desiredCount);

      stripWidth = width / strips.length;
      for (const strip of strips) {
        // The overlap hides seams between neighbouring strips.
        strip.element.style.width = `${stripWidth + 0.45}px`;
        strip.element.style.backgroundSize = `${width}px ${height}px`;
        strip.element.style.backgroundPosition = `${-(strip.key * stripWidth)}px 0px`;
      }
      arrangement.forEach((strip, slot) => setPosition(strip, slot, 0));

      return rebuilt;
    };

    const assemble = () => {
      arrangement = [...strips];
      arrangement.forEach((strip, slot) => setPosition(strip, slot, 0));
      clearMarks();
      setPhase("complete");
    };

    const scramble = async () => {
      setPhase("scrambling");
      clearMarks();
      veil.dataset.active = "true";
      arrangement = shuffleOrder(strips.length).map((key) => strips[key]);
      arrangement.forEach((strip, slot) => setPosition(strip, slot, SCRAMBLE_MOVE_MS));
      await sleep(SCRAMBLE_SETTLE_MS);
      veil.dataset.active = "false";
      await sleep(VEIL_RELEASE_MS);
    };

    const playAlgorithm = async (algorithm: SortingAlgorithm, token: number) => {
      const timing = ALGORITHM_TIMINGS[algorithm];
      const steps = sortingSteps(
        algorithm,
        arrangement.map((strip) => strip.key),
      );

      for (const step of steps) {
        await waitUntilPlayable();
        if (token !== runToken) return;

        switch (step.kind) {
          case "compare":
            markPair(step.left, step.right);
            await sleep(timing.compare);
            break;
          case "pivot":
            markPivot(step.index, step.pivot);
            await sleep(timing.compare);
            break;
          case "range":
            showRange(step.left, step.right);
            break;
          case "swap":
            applySortingStep(arrangement, step);
            setPosition(arrangement[step.left], step.left, timing.move);
            setPosition(arrangement[step.right], step.right, timing.move);
            await sleep(timing.move + MOVE_TAIL_MS);
            break;
          case "reorder":
            applySortingStep(arrangement, step);
            for (let offset = 0; offset < step.order.length; offset += 1) {
              const slot = step.left + offset;
              setPosition(arrangement[slot], slot, timing.move);
            }
            await sleep(timing.move + MOVE_TAIL_MS);
            break;
          case "settled":
            delete arrangement[step.index]?.element.dataset.mark;
            break;
        }
      }
    };

    const loop = async (token: number) => {
      while (token === runToken && !disposed) {
        for (const algorithm of ALGORITHM_ORDER) {
          await waitUntilPlayable();
          if (token !== runToken) return;

          await scramble();
          if (token !== runToken) return;

          setPhase("sorting");
          await playAlgorithm(algorithm, token);
          if (token !== runToken) return;

          clearMarks();
          setPhase("complete");
          await sleep(COMPLETE_HOLD_MS);
        }

        await sleep(CYCLE_GAP_MS);
      }
    };

    const restart = () => {
      const token = ++runToken;
      // Reduced motion gets the assembled frame with no scramble and no loop.
      if (prefersReducedMotion) {
        assemble();
        return;
      }

      void loop(token);
    };

    const resizeObserver = new ResizeObserver(() => {
      if (layout()) restart();
    });

    const intersectionObserver = new IntersectionObserver((entries) => {
      isOnScreen = entries.some((entry) => entry.isIntersecting);
      syncPlayback();
    });

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      syncPlayback();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    resizeObserver.observe(stripsRoot);
    intersectionObserver.observe(root);

    void paintImagePlaceholderBackdrop(aspectRatioValue(aspectRatio)).then((backdrop) => {
      if (disposed || !backdrop) return;
      // Published once here so the data URL is stored a single time.
      stripsRoot.style.setProperty("--backdrop", `url(${backdrop})`);
    });

    buildStrips(MAX_STRIP_COUNT);
    layout();
    restart();

    return () => {
      disposed = true;
      runToken += 1;
      releaseWaiters();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
    };
  }, [aspectRatio, prefersReducedMotion]);

  return (
    <div
      ref={rootRef}
      className={styles.placeholder}
      style={{ "--frame-ratio": aspectRatio } as CSSProperties}
      data-phase="scrambling"
      data-pw="image-generation-placeholder"
      aria-hidden="true"
    >
      <div className={styles.stageFrame} data-pw="image-generation-stage">
        <div ref={stageRef} className={styles.stage} data-phase="scrambling">
          <div ref={stripsRef} className={styles.strips} />
          <div ref={rangeRef} className={styles.range} data-active="false" />
          <div ref={veilRef} className={styles.veil} data-active="false" />
          <div className={styles.registration}>
            <i className={`${styles.reg} ${styles.regTopLeft}`} />
            <i className={`${styles.reg} ${styles.regTopRight}`} />
            <i className={`${styles.reg} ${styles.regBottomLeft}`} />
            <i className={`${styles.reg} ${styles.regBottomRight}`} />
          </div>
        </div>
      </div>

      <div className={styles.hud}>
        <i className={styles.statusDot} />
        <p className={styles.statusTitle}>{label}</p>
      </div>
    </div>
  );
}
