export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, amount: number) {
  return (1 - amount) * start + amount * end;
}

export function applyTransitionEasing(raw: number, easing: string) {
  const t = clamp(raw, 0, 1);

  if (easing === "linear") {
    return t;
  }

  if (easing === "ease-in") {
    return t * t;
  }

  if (easing === "ease-out") {
    return 1 - (1 - t) ** 2;
  }

  return 0.5 - 0.5 * Math.cos(t * Math.PI);
}

export function seededNoise(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

export function getMoveZScale(value: number) {
  return 25 ** (clamp(value, -100, 100) / 100);
}
