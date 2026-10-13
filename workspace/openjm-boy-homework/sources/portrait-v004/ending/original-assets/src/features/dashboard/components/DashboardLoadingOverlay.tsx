"use client";

import React from "react";
import BrandMark from "@/components/layout/BrandMark";
import { OPEN_JM_BRAND } from "@/config/brand";
import { useDashboardLoaderSequence } from "@/features/dashboard/hooks/useDashboardLoaderSequence";
import type {
  BrandMarkHandoff,
  LoaderStage,
} from "@/features/dashboard/utils/dashboardLoaderSequence";
import styles from "@/styles/features/dashboard/DashboardLoadingOverlay.module.css";

type DashboardLoadingOverlayProps = {
  isDashboardReady: boolean;
  onHoldChange: (isActive: boolean) => void;
  onStageChange: (stage: LoaderStage) => void;
  onHandoffChange: (handoff: BrandMarkHandoff) => void;
};

export default function DashboardLoadingOverlay({
  isDashboardReady,
  onHoldChange,
  onStageChange,
  onHandoffChange,
}: DashboardLoadingOverlayProps) {
  const { stage, fallback, isAwaitingData, hasArrived, overlayRef, canvasRef } =
    useDashboardLoaderSequence({
      isDashboardReady,
      onHoldChange,
      onStageChange,
      onHandoffChange,
    });

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-busy={stage !== "exiting"}
      data-pw="dashboard-loading-overlay"
      data-loader-stage={stage}
      data-loader-fallback={fallback ?? undefined}
      data-loader-awaiting-data={isAwaitingData ? "true" : undefined}
      data-loader-arrived={hasArrived ? "true" : undefined}
    >
      <span className={styles.srOnly}>Loading your workspace</span>
      <div className={styles.backdrop} data-pw="dashboard-loader-backdrop" />
      <div className={styles.halo} aria-hidden="true" />
      <div
        className={styles.logoStage}
        aria-hidden="true"
        data-pw="dashboard-loader-logo"
      >
        <BrandMark />
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.brand} aria-hidden="true">
        <img
          className={styles.wordmark}
          src={OPEN_JM_BRAND.logos.word}
          alt=""
          decoding="async"
        />
        <span className={styles.status} data-pw="dashboard-loader-status">
          <span className={styles.statusText}>Preparing your workspace…</span>
        </span>
      </div>
    </div>
  );
}
