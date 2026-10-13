import { gsap } from 'gsap';
import * as THREE from 'three';
import { createHummingbirdScene } from './loader/hummingbirdScene';
import { createHummingbirdScene as createReference } from './reference/hummingbirdScene';
import { FLIGHT_SEED, PARTICLE_SEED, seededRandom } from './random.mjs';

const root = document.getElementById('root')!;
const canvas = document.getElementById('bird') as HTMLCanvasElement;
const logo = document.getElementById('logo-stage')!;
const mark = document.getElementById('logo')!;
const duration = Number(root.dataset.duration);
const FPS = 60;
const HOLD = 0.5;
const CENTER_HOLD = 1.5;
const FADE = 0.6;
const END_HOLD = 0.5;
const fadeStart = Number(root.dataset.fadeStart);
const backdrop = document.getElementById('backdrop')!;
const halo = document.getElementById('halo')!;
const brand = document.getElementById('brand')!;
const referenceMode = new URLSearchParams(location.search).has('reference');

// Sample the original CSS cubic-bezier curves without a wall-clock animation.
function bezier(x: number, x1: number, y1: number, x2: number, y2: number) {
  const curve = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let low = 0, high = 1;
  for (let i = 0; i < 30; i++) {
    const middle = (low + high) / 2;
    if (curve(middle, x1, x2) < x) low = middle; else high = middle;
  }
  return curve((low + high) / 2, y1, y2);
}

function applyDOM(time: number, frame: { bird: { x: number; y: number }; presence: number; arrived: boolean; canvasOpacity: number }) {
  const flying = time >= HOLD;
  root.dataset.loaderStage = flying ? 'flying' : 'preparing-3d';
  root.dataset.loaderArrived = flying && frame.arrived ? 'true' : 'false';
  root.style.setProperty('--loader-bird-x', `${frame.bird.x}px`);
  root.style.setProperty('--loader-bird-y', `${frame.bird.y}px`);
  root.style.setProperty('--loader-bird-presence', `${flying ? frame.presence : 0}`);
  const fadeProgress = Math.min(1, Math.max(0, (time - fadeStart) / FADE));
  const dissolve = bezier(fadeProgress, 0.42, 0, 0.58, 1);
  root.style.setProperty('--loader-canvas-opacity', `${frame.canvasOpacity * (1 - dissolve)}`);
  backdrop.style.opacity = `${1 - dissolve}`;
  halo.style.opacity = `${(flying ? 0.55 * frame.presence : 0) * (1 - dissolve)}`;
  brand.style.top = `${78 - 28 * dissolve}%`;
  brand.style.translate = `-50% ${-50 * dissolve}%`;
  const fade = Math.min(1, Math.max(0, (time - HOLD) / 0.22));
  logo.style.opacity = `${1 - bezier(fade, 0.25, 0.1, 0.25, 1)}`;
  const phase = (time % 2.6) / 1.3;
  const float = phase <= 1 ? bezier(phase, 0.42, 0, 0.58, 1) : 1 - bezier(phase - 1, 0.42, 0, 0.58, 1);
  mark.style.transform = `translateY(${-4 * float}px)`;
}

async function bootstrap() {
  await Promise.all([...document.images].map(image => image.decode()));
  const response = await fetch('assets/openjm-hummingbird.glb');
  if (!response.ok) throw new Error(`Local model preload failed: ${response.status}`);
  const model = await response.arrayBuffer();
  const options = { canvas, model, random: seededRandom(FLIGHT_SEED), onContextLost: () => { throw new Error('WebGL context lost'); } };
  if (referenceMode) {
    // Unmodified production runtime, with only Three's particle RNG scoped to setup.
    const random = seededRandom(PARTICLE_SEED);
    const originalFloat = THREE.MathUtils.randFloat;
    const originalSpread = THREE.MathUtils.randFloatSpread;
    THREE.MathUtils.randFloat = (low, high) => low + (high - low) * random();
    THREE.MathUtils.randFloatSpread = range => range * (0.5 - random());
    let reference;
    try { reference = await createReference(options); }
    finally { THREE.MathUtils.randFloat = originalFloat; THREE.MathUtils.randFloatSpread = originalSpread; }
    reference.resize(1080, 1920);
    let index = 0;
    let frame = reference.update(0);
    const referenceAt = (time: number) => {
      const target = Math.max(0, Math.round((time - HOLD) * FPS));
      if (target < index) throw new Error('Reference comparison must step forward');
      while (index < target) { frame = reference.update(1 / FPS); index++; }
      applyDOM(time, frame);
      return frame;
    };
    Object.assign(window, { loaderReferenceAt: referenceAt, loaderReady: true });
    referenceAt(0);
    return;
  }

  const scene = await createHummingbirdScene({ ...options, particleRandom: seededRandom(PARTICLE_SEED) });
  scene.resize(1080, 1920);
  const baked = scene.bakeEntrance(Math.ceil((duration - HOLD) * FPS));
  const arrivalTime = HOLD + baked.arrivalFrame / FPS;
  if (arrivalTime >= fadeStart) throw new Error('Portrait entrance must arrive before the fixed fade');
  const renderAt = (requestedTime: number) => {
    const time = Math.min(duration, Math.max(0, requestedTime));
    const index = Math.min(baked.snapshots.length - 1, Math.max(0, Math.round((time - HOLD) * FPS)));
    const snapshot = baked.snapshots[index];
    scene.renderSnapshot(snapshot);
    applyDOM(time, snapshot.frame);
    return { time, index, frame: snapshot.frame, behavior: snapshot.behavior };
  };
  const clock = { time: 0 };
  const timeline = gsap.timeline({ paused: true });
  timeline.to(clock, { time: duration, duration, ease: 'none', onUpdate: () => renderAt(clock.time) }, 0);
  window.addEventListener('hf-seek', ((event: CustomEvent) => renderAt(event.detail.time)) as EventListener);
  renderAt(0);
  timeline.seek(0);
  const diagnostics = {
    fps: FPS, duration, entranceSeconds: baked.arrivalFrame / FPS,
    arrivalFrame: baked.arrivalFrame, arrivalTime: HOLD + baked.arrivalFrame / FPS,
    simulationFps: FPS, deliveryFps: 25, outputFrames: 129, snapshotCount: baked.snapshots.length,
    flightSeed: FLIGHT_SEED, particleSeed: PARTICLE_SEED,
    transformsPerSnapshot: baked.snapshots[0].transforms.length / 10,
    moteCount: baked.snapshots[0].particles[0].length / 3,
    trailSlots: baked.snapshots[0].particles[3].length / 3,
    hoverStates: [...new Set(baked.snapshots.slice(baked.arrivalFrame).map(s => s.behavior))],
    centerHold: fadeStart - arrivalTime, fadeSeconds: FADE, fadeStart, fadeEnd: fadeStart + FADE, finalWordmarkHold: duration - fadeStart - FADE,
  };
  Object.assign(window, { loaderRenderAt: renderAt, loaderTimeline: timeline, loaderDiagnostics: diagnostics, loaderReady: true });
}

(window as any).__hf = (window as any).__hf || {};
(window as any).__hf.buildReady = (window as any).__hf.buildReady || {};
(window as any).__hf.buildReady['dashboard-loader'] = bootstrap();
