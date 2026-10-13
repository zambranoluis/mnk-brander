import type { MorphRgb } from "../types/morph";
import { clamp, lerp } from "./math";

export function normalizeHex(hex: string) {
  const cleaned = hex.trim().replace("#", "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((character) => character + character)
          .join("")
      : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return "#000000";
  }

  return `#${expanded.toLowerCase()}`;
}

export function hexToRgb(hex: string): MorphRgb {
  const normalized = normalizeHex(hex).slice(1);

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function rgbToHex(color: MorphRgb) {
  const value =
    (1 << 24) |
    (clamp(Math.round(color.r), 0, 255) << 16) |
    (clamp(Math.round(color.g), 0, 255) << 8) |
    clamp(Math.round(color.b), 0, 255);

  return `#${value.toString(16).slice(1)}`;
}

export function mixRgb(start: MorphRgb, end: MorphRgb, amount: number): MorphRgb {
  const t = clamp(amount, 0, 1);

  return {
    r: Math.round(lerp(start.r, end.r, t)),
    g: Math.round(lerp(start.g, end.g, t)),
    b: Math.round(lerp(start.b, end.b, t)),
  };
}

export function lerpHexColor(start: string, end: string, amount: number) {
  return rgbToHex(mixRgb(hexToRgb(start), hexToRgb(end), amount));
}

export function rgbString(color: MorphRgb) {
  return `${color.r}, ${color.g}, ${color.b}`;
}
