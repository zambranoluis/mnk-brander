import { createTimelineState, DEFAULT_MORPH_PARAMS } from "@/features/morph/engine/defaults";
import type { MorphMode, MorphParams, MorphPreset, MorphTimelineState } from "@/features/morph/types/morph";

const CHAT_MORPH_STANDBY_PARAMS: MorphParams = {
  ...DEFAULT_MORPH_PARAMS,
  points: 700,
  trail: 1,
  figureOpacity: 1,
  size: 0.8,
  sphereRadius: 0.3,
  color1: "#00ff91",
  color2: "#096672",
  speed: 0.03,
  morph: 0.25,
  rotX: -0.3,
  rotY: 0.3,
};

const CHAT_MORPH_WORKING_PARAMS: MorphParams = {
  ...CHAT_MORPH_STANDBY_PARAMS,
  points: 900,
  size: 0.96,
  sphereRadius: 0.36,
  color1: "#8c6cff",
  color2: "#20d9c1",
  speed: 0.046,
  morph: 0.46,
  pulseForce: 2.2,
  sizeImpact: 1.4,
};

const CHAT_MORPH_MENU_OPEN_PARAMS: MorphParams = {
  ...CHAT_MORPH_STANDBY_PARAMS,
  points: 700,
  size: 0.88,
  sphereRadius: 0.38,
  speed: 0.028,
  morph: 0.32,
  color1: "#00ffc8",
  color2: "#16949b",
};

const CHAT_MORPH_MUSIC_PARAMS: MorphParams = {
  ...CHAT_MORPH_STANDBY_PARAMS,
  shape: "music",
  points: 2000,
  size: 0.62,
  sphereRadius: 0.62,
  color1: "#00ffe0",
  color2: "#00a89b",
  speed: 0.018,
  morph: 0.08,
  rotX: 0,
  rotY: 0,
};

const CHAT_MORPH_IMAGE_PARAMS: MorphParams = {
  ...CHAT_MORPH_MUSIC_PARAMS,
  shape: "image",
  points: 1400,
  size: 0.58,
  sphereRadius: 0.56,
  color1: "#00ffc8",
  color2: "#008e86",
  speed: 0.016,
  morph: 0.045,
};

const CHAT_MORPH_CODE_PARAMS: MorphParams = {
  ...CHAT_MORPH_MUSIC_PARAMS,
  shape: "code",
  points: 1600,
  size: 0.62,
  sphereRadius: 0.6,
  color1: "#00e6d5",
  color2: "#00a594",
  speed: 0.014,
  morph: 0.03,
};

const CHAT_MORPH_VIDEO_PARAMS: MorphParams = {
  ...CHAT_MORPH_MUSIC_PARAMS,
  shape: "video",
  points: 2200,
  size: 0.6,
  sphereRadius: 0.58,
  color1: "#00f4e6",
  color2: "#009d96",
  speed: 0.015,
  morph: 0.035,
};

// Rest values for the audio-reactive bloom; the renderer swells the core,
// stretches the rays and sends the shockwave rings outward on top.
const CHAT_MORPH_PLAYING_PARAMS: MorphParams = {
  ...CHAT_MORPH_MUSIC_PARAMS,
  shape: "bloom",
  points: 2200,
  size: 0.6,
  sphereRadius: 0.5,
  color1: "#5cffd6",
  color2: "#8c6cff",
  morph: 0.02,
  pulseForce: 0.9,
  pulseDecay: 0.9,
  sizeImpact: 0.35,
};

function createChatTimelineState(
  id: string,
  name: string,
  data: MorphParams,
  duration = 5 / 3,
): MorphTimelineState {
  return createTimelineState(id, name, data, duration);
}

export const CHAT_MORPH_STANDBY_PRESET: MorphPreset = {
  version: "morph-preset-v1",
  name: "Chat morph orb",
  params: CHAT_MORPH_STANDBY_PARAMS,
  timeline: [
    createChatTimelineState("standby-green-start", "Standby green", CHAT_MORPH_STANDBY_PARAMS),
    createChatTimelineState("standby-blue-violet", "Standby blue violet", {
      ...CHAT_MORPH_STANDBY_PARAMS,
      color1: "#2b00ff",
      color2: "#52cddd",
      speed: 0.037,
      morph: 0.33,
    }),
    createChatTimelineState("standby-green-end", "Standby green", CHAT_MORPH_STANDBY_PARAMS),
  ],
  duration: 5,
  loop: true,
};

export const CHAT_MORPH_WORKING_PRESET: MorphPreset = {
  version: "morph-preset-v1",
  name: "Chat morph working",
  params: CHAT_MORPH_WORKING_PARAMS,
  timeline: [
    createChatTimelineState(
      "working-cube",
      "Working cube",
      {
        ...CHAT_MORPH_WORKING_PARAMS,
        shape: "cube",
      },
      1.4,
    ),
    createChatTimelineState(
      "working-sphere",
      "Working sphere",
      {
        ...CHAT_MORPH_WORKING_PARAMS,
        shape: "sphere",
      },
      1.4,
    ),
    createChatTimelineState(
      "working-pyramid",
      "Working pyramid",
      {
        ...CHAT_MORPH_WORKING_PARAMS,
        shape: "pyramid",
      },
      1.4,
    ),
  ],
  duration: 4.2,
  loop: true,
};

function createChatShapePreset(
  name: string,
  stateId: string,
  params: MorphParams,
): MorphPreset {
  return {
    version: "morph-preset-v1",
    name,
    params,
    timeline: [createChatTimelineState(stateId, name, params)],
    duration: 5,
    loop: true,
  };
}

export const CHAT_MORPH_MUSIC_PRESET = createChatShapePreset(
  "Chat morph music",
  "music-note-wave",
  CHAT_MORPH_MUSIC_PARAMS,
);

export const CHAT_MORPH_IMAGE_PRESET = createChatShapePreset(
  "Chat morph image",
  "image-organic-frame",
  CHAT_MORPH_IMAGE_PARAMS,
);

export const CHAT_MORPH_CODE_PRESET = createChatShapePreset(
  "Chat morph code",
  "code-braces",
  CHAT_MORPH_CODE_PARAMS,
);

export const CHAT_MORPH_VIDEO_PRESET = createChatShapePreset(
  "Chat morph video",
  "video-clapperboard",
  CHAT_MORPH_VIDEO_PARAMS,
);

const CHAT_MORPH_PLAYING_PRESET = createChatShapePreset(
  "Chat morph playing",
  "playing-sonic-bloom",
  CHAT_MORPH_PLAYING_PARAMS,
);

export const CHAT_MORPH_MENU_OPEN_PRESET: MorphPreset = {
  version: "morph-preset-v1",
  name: "Chat morph menu open",
  params: CHAT_MORPH_MENU_OPEN_PARAMS,
  timeline: [
    createChatTimelineState(
      "menu-open-green-start",
      "Menu open green",
      CHAT_MORPH_MENU_OPEN_PARAMS,
    ),
    createChatTimelineState("menu-open-aqua", "Menu open aqua", {
      ...CHAT_MORPH_MENU_OPEN_PARAMS,
      color1: "#73ffe0",
      color2: "#176c77",
      speed: 0.032,
    }),
    createChatTimelineState(
      "menu-open-green-end",
      "Menu open green",
      CHAT_MORPH_MENU_OPEN_PARAMS,
    ),
  ],
  duration: 4.2,
  loop: true,
};

export const CHAT_MORPH_MODES: Record<MorphMode, MorphPreset> = {
  standby: CHAT_MORPH_STANDBY_PRESET,
  working: CHAT_MORPH_WORKING_PRESET,
  music: CHAT_MORPH_MUSIC_PRESET,
  image: CHAT_MORPH_IMAGE_PRESET,
  code: CHAT_MORPH_CODE_PRESET,
  video: CHAT_MORPH_VIDEO_PRESET,
  menuOpen: CHAT_MORPH_MENU_OPEN_PRESET,
  playing: CHAT_MORPH_PLAYING_PRESET,
};
