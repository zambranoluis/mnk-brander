import React from "react";
import { OPEN_JM_BRAND } from "@/config/brand";
import styles from "@/styles/components/BrandMark/BrandMark.module.css";

type BrandMarkProps = {
  className?: string;
  "data-pw"?: string;
};

/**
 * The OpenJM launch mark: the brand icon with a slow float, static under
 * reduced motion. Every launch screen paints it first.
 */
export default function BrandMark({ className, "data-pw": dataPw }: BrandMarkProps) {
  return (
    <img
      className={className ? `${styles.mark} ${className}` : styles.mark}
      src={OPEN_JM_BRAND.logos.icon}
      alt=""
      decoding="async"
      data-pw={dataPw}
    />
  );
}
