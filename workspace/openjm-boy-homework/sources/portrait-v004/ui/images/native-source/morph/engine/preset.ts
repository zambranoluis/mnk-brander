import type { MorphPreset, MorphTimelineState } from "../types/morph";
import {
  DEFAULT_CLOUD_SETTINGS,
  DEFAULT_HELIX_SETTINGS,
  DEFAULT_MORPH_PARAMS,
} from "./defaults";

function normalizeTimelineState(
  state: Partial<MorphTimelineState>,
  index: number,
  createStateId: (index: number) => string,
): MorphTimelineState {
  return {
    id: typeof state.id === "string" ? state.id : createStateId(index),
    name: typeof state.name === "string" ? state.name : `State ${index + 1}`,
    duration: typeof state.duration === "number" ? state.duration : 2.5,
    data: { ...DEFAULT_MORPH_PARAMS, ...state.data },
    transitionEase: state.transitionEase ?? "smooth",
    transitionEffect: state.transitionEffect ?? "direct",
    cloud: { ...DEFAULT_CLOUD_SETTINGS, ...state.cloud },
    helix: { ...DEFAULT_HELIX_SETTINGS, ...state.helix },
  };
}

export function normalizeMorphPreset(
  value: unknown,
  createStateId: (index: number) => string,
): MorphPreset | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<MorphPreset>;

  if (!candidate.params || typeof candidate.params !== "object") {
    return null;
  }

  return {
    version: "morph-preset-v1",
    name: typeof candidate.name === "string" ? candidate.name : "Imported morph workspace",
    params: { ...DEFAULT_MORPH_PARAMS, ...candidate.params },
    timeline: Array.isArray(candidate.timeline)
      ? candidate.timeline.map((state, index) =>
          normalizeTimelineState(state as Partial<MorphTimelineState>, index, createStateId),
        )
      : [],
    duration: typeof candidate.duration === "number" ? candidate.duration : 5,
    loop: typeof candidate.loop === "boolean" ? candidate.loop : true,
  };
}
