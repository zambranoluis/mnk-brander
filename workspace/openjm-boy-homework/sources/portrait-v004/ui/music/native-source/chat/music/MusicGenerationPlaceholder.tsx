"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { FaMusic } from "react-icons/fa";
import styles from "./MusicGenerationPlaceholder.module.css";

const BAR_COUNT = 28;
const bars = Array.from({ length: BAR_COUNT }, (_, index) => index);

// Sum of two sines gives a smooth, non-repeating crest instead of a sawtooth.
function barHeight(index: number) {
  const wave = Math.sin(index * 0.55) + Math.sin(index * 0.21 + 1.4) * 0.6;
  return Math.round(42 + wave * 22);
}

function barStyle(index: number) {
  return { "--base": barHeight(index), "--i": index } as CSSProperties;
}

type MusicGenerationPlaceholderProps = {
  label: string;
  active: boolean;
};

export default function MusicGenerationPlaceholder({ label, active }: MusicGenerationPlaceholderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let isPageVisible = document.visibilityState === "visible";
    let isOnScreen = false;

    // DESIGN.md requires continuous animation to pause while hidden or offscreen.
    const sync = () => { root.dataset.playing = String(active && isPageVisible && isOnScreen); };

    const intersectionObserver = new IntersectionObserver((entries) => {
      isOnScreen = entries.some((entry) => entry.isIntersecting);
      sync();
    });

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      sync();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    intersectionObserver.observe(root);

    return () => {
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active]);

  return (
    <div
      ref={rootRef}
      className={styles.placeholder}
      data-playing="false"
      data-active={active}
      aria-hidden="true"
      data-pw="music-generation-placeholder"
    >
      <div className={styles.stageFrame} data-pw="music-generation-stage">
        <div className={styles.stage}>
          <span className={styles.mark}><FaMusic aria-hidden="true" /></span>
          <div className={styles.bars} data-pw="music-generation-bars">
            {bars.map((index) => <i key={index} className={styles.bar} style={barStyle(index)} />)}
          </div>
          <div className={styles.scan} />
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
