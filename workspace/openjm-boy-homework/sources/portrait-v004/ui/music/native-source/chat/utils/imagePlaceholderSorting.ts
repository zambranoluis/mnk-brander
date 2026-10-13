// DOM-free model of the image generation placeholder animation. The renderer
// walks these steps and owns every duration, so the traversals stay testable
// without a browser.

export type SortingAlgorithm = "bubble" | "merge" | "quick";

export type SortingStep =
  | { kind: "compare"; left: number; right: number }
  | { kind: "pivot"; index: number; pivot: number }
  | { kind: "range"; left: number; right: number }
  | { kind: "swap"; left: number; right: number }
  // `order` lists source slots, in their merged sequence, that land on
  // `left`, `left + 1`, ... once the step is applied.
  | { kind: "reorder"; left: number; order: number[] }
  | { kind: "settled"; index: number };

export function shuffleOrder(
  count: number,
  random: () => number = Math.random,
): number[] {
  const order = Array.from({ length: count }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [order[index], order[target]] = [order[target], order[index]];
  }

  // An already sorted scramble would show nothing to reassemble.
  if (order.length > 1 && order.every((key, index) => key === index)) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  return order;
}

export function applySortingStep<T>(slots: T[], step: SortingStep) {
  if (step.kind === "swap") {
    [slots[step.left], slots[step.right]] = [slots[step.right], slots[step.left]];
    return;
  }

  if (step.kind === "reorder") {
    const moved = step.order.map((slot) => slots[slot]);
    moved.forEach((value, offset) => {
      slots[step.left + offset] = value;
    });
  }
}

function settleRemaining(settled: Set<number>, count: number, steps: SortingStep[]) {
  for (let index = 0; index < count; index += 1) {
    if (settled.has(index)) continue;
    steps.push({ kind: "settled", index });
  }
}

function bubbleSteps(keys: number[], steps: SortingStep[]) {
  const settled = new Set<number>();

  for (let end = keys.length - 1; end > 0; end -= 1) {
    let changed = false;

    for (let index = 0; index < end; index += 1) {
      steps.push({ kind: "compare", left: index, right: index + 1 });
      if (keys[index] > keys[index + 1]) {
        const step: SortingStep = { kind: "swap", left: index, right: index + 1 };
        applySortingStep(keys, step);
        steps.push(step);
        changed = true;
      }
    }

    steps.push({ kind: "settled", index: end });
    settled.add(end);
    if (!changed) break;
  }

  settleRemaining(settled, keys.length, steps);
}

function mergeSteps(keys: number[], steps: SortingStep[]) {
  const count = keys.length;

  for (let width = 1; width < count; width *= 2) {
    for (let left = 0; left < count; left += 2 * width) {
      const mid = Math.min(left + width, count);
      const right = Math.min(left + 2 * width, count);
      if (mid >= right) continue;

      steps.push({ kind: "range", left, right: right - 1 });

      const order: number[] = [];
      let lower = left;
      let upper = mid;

      while (lower < mid && upper < right) {
        steps.push({ kind: "compare", left: lower, right: upper });
        if (keys[lower] <= keys[upper]) order.push(lower++);
        else order.push(upper++);
      }

      while (lower < mid) order.push(lower++);
      while (upper < right) order.push(upper++);

      const step: SortingStep = { kind: "reorder", left, order };
      applySortingStep(keys, step);
      steps.push(step);
    }
  }

  settleRemaining(new Set(), count, steps);
}

function quickSteps(keys: number[], steps: SortingStep[]) {
  const settled = new Set<number>();

  const sort = (low: number, high: number) => {
    if (low >= high) return;

    steps.push({ kind: "range", left: low, right: high });

    const pivotKey = keys[high];
    let boundary = low;

    for (let index = low; index < high; index += 1) {
      steps.push({ kind: "pivot", index, pivot: keys.indexOf(pivotKey) });
      if (keys[index] < pivotKey) {
        if (boundary !== index) {
          const step: SortingStep = { kind: "swap", left: boundary, right: index };
          applySortingStep(keys, step);
          steps.push(step);
        }
        boundary += 1;
      }
    }

    const pivotSlot = keys.indexOf(pivotKey);
    if (boundary !== pivotSlot) {
      const step: SortingStep = { kind: "swap", left: boundary, right: pivotSlot };
      applySortingStep(keys, step);
      steps.push(step);
    }

    steps.push({ kind: "settled", index: boundary });
    settled.add(boundary);

    sort(low, boundary - 1);
    sort(boundary + 1, high);
  };

  sort(0, keys.length - 1);
  settleRemaining(settled, keys.length, steps);
}

export function sortingSteps(
  algorithm: SortingAlgorithm,
  order: readonly number[],
): SortingStep[] {
  const keys = [...order];
  const steps: SortingStep[] = [];

  if (algorithm === "bubble") bubbleSteps(keys, steps);
  else if (algorithm === "merge") mergeSteps(keys, steps);
  else quickSteps(keys, steps);

  return steps;
}
