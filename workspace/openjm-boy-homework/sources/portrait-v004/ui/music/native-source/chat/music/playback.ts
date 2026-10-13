import type { MorphAudioFrame } from "@/features/morph/types/morph";
import { createAudioFeatureState, detectBeat, emptyAudioFrame, reduceSpectrum } from "./audioFeatures";

// Tracks the one song that is playing across every music card on the page and
// exposes its analysed spectrum to the morph. One AudioContext serves every
// card; a media element can only be routed into it once, so each element's
// analyser graph is created on first use and reused for later plays.

type AnalysedElement = {
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
};

type AudioContextConstructor = typeof AudioContext;

const FFT_SIZE = 2048;
const graphs = new WeakMap<HTMLAudioElement, AnalysedElement>();
const listeners = new Set<() => void>();
const silentFrame = emptyAudioFrame();
let context: AudioContext | null = null;
let activeElement: HTMLAudioElement | null = null;
let featureState = createAudioFeatureState();
let bytes: Uint8Array<ArrayBuffer> | null = null;
let lastFrameMs = Number.NaN;
let lastFrame: MorphAudioFrame | null = null;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function resolveAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.AudioContext ??
    (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext ??
    null;
}

function connect(element: HTMLAudioElement) {
  if (!context || context.state !== "running" || graphs.has(element)) {
    return;
  }

  try {
    const source = context.createMediaElementSource(element);
    const analyser = context.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);
    analyser.connect(context.destination);
    graphs.set(element, { source, analyser });
  } catch {
    // Analysis is decorative; playback continues through the element itself.
  }
}

function handleContextStateChange() {
  if (!context || !activeElement) {
    return;
  }

  if (context.state === "running") {
    connect(activeElement);
    return;
  }

  // A connected element is silent while its context is not running, as after
  // an interruption on Safari, so try to bring the context back.
  void context.resume().catch(() => undefined);
}

/** Creates or resumes the shared AudioContext; call it inside the play gesture. */
export function primeMusicAnalysis() {
  const AudioContextCtor = resolveAudioContextConstructor();

  if (!AudioContextCtor) {
    return;
  }

  if (!context) {
    try {
      context = new AudioContextCtor();
    } catch {
      return;
    }

    context.addEventListener("statechange", handleContextStateChange);
  }

  if (context.state !== "running") {
    void context.resume().catch(() => undefined);
  }
}

export function startMusicPlayback(element: HTMLAudioElement) {
  const previous = activeElement;

  if (previous !== element) {
    activeElement = element;
    featureState = createAudioFeatureState();
    lastFrame = null;
    lastFrameMs = Number.NaN;
    previous?.pause();
  }

  // Only route through a running context: a suspended one would silence the
  // element. Playback without analysis still shows the bloom.
  connect(element);
  notify();
}

export function stopMusicPlayback(element: HTMLAudioElement) {
  if (activeElement !== element) {
    return;
  }

  activeElement = null;
  notify();
}

/** Stops the element and releases its analyser graph when its card unmounts. */
export function releaseMusicPlayback(element: HTMLAudioElement) {
  stopMusicPlayback(element);

  const graph = graphs.get(element);

  if (!graph) {
    return;
  }

  graph.source.disconnect();
  graph.analyser.disconnect();
  graphs.delete(element);
}

export function subscribeMusicPlayback(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function isMusicPlaying() {
  return activeElement !== null;
}

/**
 * Returns the analysed frame for the playing song, silence when it cannot be
 * analysed, or null when nothing plays. Computed at most once per timestamp.
 */
export function readMusicAudioFrame(nowMs: number): MorphAudioFrame | null {
  if (!activeElement) {
    return null;
  }

  if (nowMs === lastFrameMs && lastFrame) {
    return lastFrame;
  }

  const graph = graphs.get(activeElement);

  if (!graph || !context || context.state !== "running") {
    return silentFrame;
  }

  if (bytes?.length !== graph.analyser.frequencyBinCount) {
    bytes = new Uint8Array(graph.analyser.frequencyBinCount);
  }

  graph.analyser.getByteFrequencyData(bytes);
  const summary = reduceSpectrum(bytes, context.sampleRate, graph.analyser.fftSize, featureState);
  lastFrameMs = nowMs;
  lastFrame = {
    ...summary,
    beat: detectBeat(featureState, summary.bass, nowMs),
    spectrum: featureState.spectrum,
  };

  return lastFrame;
}
