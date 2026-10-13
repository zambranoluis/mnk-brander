/**
 * Imperative three.js scene for the dashboard loading overlay's hummingbird.
 *
 * The overlay imports this module dynamically so three.js stays out of the
 * dashboard bundle. It owns the renderer, the model and the mapping from the
 * flight pose to the rig; hummingbirdFlight owns where the bird goes and how
 * it moves, hummingbirdAmbience the motes and trail. The overlay owns the
 * frame loop, pointer events, timing and every DOM layer but the canvas.
 *
 * Constants are the approved tuning from the loader preview
 * (workspace/dashboard-3d-loader/preview/hummingbird-loader.html).
 */

import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LoaderAmbience } from "@/features/dashboard/components/loader/hummingbirdAmbience";
import { ATTITUDE } from "@/features/dashboard/utils/hummingbirdBody";
import {
  BIRD_HEIGHT,
  CAMERA_FOV_DEGREES,
  CAMERA_Z,
  createFlight,
  deriveFlightLayout,
  setExitTarget,
  setFlightLayout,
  startExit,
  stepFlight,
  type FlightLayout,
  type FlightPose,
  type FlightState,
  type RandomSource,
  type Vec3,
} from "@/features/dashboard/utils/hummingbirdFlight";

/** A landing slot's center and height in canvas-local CSS pixels. */
export type LandingSlot = { x: number; y: number; height: number };

export type HummingbirdExit =
  | { kind: "landing"; measure: () => LandingSlot | null }
  | { kind: "fly-past" };

export type HummingbirdFrame = {
  /** The bird's projected position in canvas-local CSS pixels. */
  bird: { x: number; y: number };
  /** Opacity of the canvas; falls to 0 as the bird settles into its slot. */
  canvasOpacity: number;
  /** How far the bird has come in on its entrance, 0–1, for the halo and wordmark. */
  presence: number;
  /** The bird has settled at the center after its entrance. */
  arrived: boolean;
  /** The landing crossfade into the slot has begun. */
  touchedDown: boolean;
  /** The exit has finished. */
  exited: boolean;
};

export type HummingbirdScene = {
  resize(width: number, height: number): void;
  /** The pointer moved or tapped at canvas-local CSS pixels. */
  setPointer(x: number, y: number): void;
  clearPointer(): void;
  /** A click at canvas-local CSS pixels; startles the bird when it hits it. */
  poke(x: number, y: number): void;
  startExit(exit: HummingbirdExit): void;
  /** Advances by dt seconds and renders. */
  update(dt: number): HummingbirdFrame;
  dispose(): void;
};

type SceneOptions = {
  canvas: HTMLCanvasElement;
  /** The GLB file's bytes. */
  model: ArrayBuffer;
  onContextLost: () => void;
  random?: RandomSource;
};

type Landing = {
  measure: () => LandingSlot | null;
  slot: LandingSlot;
};

const LANDING_TOUCHDOWN = 0.86;
/** Extra spread of the tail at a full flare, on top of its depression. */
const TAIL_FAN = 0.5;
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const VISIBLE_HEIGHT =
  2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV_DEGREES / 2));

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

function addLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight("#f0f7f4", "#6a828c", 1.5));
  const directional: Array<[string, number, Vec3]> = [
    ["#fff3dc", 2.0, [-3, 5, 6]],
    ["#e9f1f0", 1.0, [4, 1, -5]],
    ["#fff5e4", 1.5, [5, 3, 2]],
    ["#fff5e4", 1.1, [-5, 2, 2]],
    ["#b2f3dc", 0.8, [-4, 2, -4]],
  ];
  for (const [color, intensity, [x, y, z]] of directional) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    scene.add(light);
  }
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    (object as THREE.SkinnedMesh).skeleton?.dispose();
    const material = mesh.material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];
    for (const item of materials) item.dispose();
  });
}

class HummingbirdRuntime implements HummingbirdScene {
  private readonly camera = new THREE.PerspectiveCamera(CAMERA_FOV_DEGREES, 16 / 10, 0.05, 100);
  private readonly flightRoot = new THREE.Group();
  private readonly bird: THREE.Group;
  private readonly tail: THREE.Object3D | null;
  private readonly birdAspect: number;
  private readonly mixer: THREE.AnimationMixer;
  private readonly flap: THREE.AnimationAction | null;
  private readonly ambience: LoaderAmbience;
  private readonly raycaster = new THREE.Raycaster();
  private readonly plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private readonly euler = new THREE.Euler();
  private readonly quat = new THREE.Quaternion();
  private readonly scratch = new THREE.Vector3();
  private width = 1;
  private height = 1;
  private layout: FlightLayout = deriveFlightLayout(16 / 10, 1);
  private flight: FlightState | null = null;
  private pointer: readonly [number, number] | null = null;
  private moved = false;
  private hit = false;
  private landing: Landing | null = null;
  private disposed = false;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly random: RandomSource;
  private readonly release: () => void;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    gltf: GLTF,
    random: RandomSource,
    release: () => void,
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.random = random;
    this.release = release;
    this.camera.position.set(0, 0, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    // Normalize the bird to BIRD_HEIGHT around its bounding-box center.
    this.bird = gltf.scene;
    this.tail = this.bird.getObjectByName("Tail") ?? null;
    const pivot = new THREE.Group();
    pivot.add(this.bird);
    const box = new THREE.Box3().setFromObject(this.bird);
    const size = box.getSize(new THREE.Vector3());
    this.bird.position.sub(box.getCenter(new THREE.Vector3()));
    pivot.scale.setScalar(BIRD_HEIGHT / size.y);
    // The wingspan (Z in the rest pose) is the widest extent the viewer can see.
    this.birdAspect = Math.max(size.x, size.z) / size.y;
    this.flightRoot.add(pivot);
    scene.add(this.flightRoot);

    this.mixer = new THREE.AnimationMixer(this.bird);
    const flapClip = THREE.AnimationClip.findByName(gltf.animations, "Flap");
    this.flap = flapClip ? this.mixer.clipAction(flapClip) : null;
    this.flap?.play();
    this.ambience = new LoaderAmbience(scene);
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.layout = deriveFlightLayout(this.camera.aspect, this.birdAspect);
    if (this.flight) setFlightLayout(this.flight, this.layout);
    if (!this.flight?.exit) this.flightRoot.scale.setScalar(this.layout.birdScale);
    this.ambience.setPointScale(this.renderer.getPixelRatio() * (this.width / 1100));
  }

  setPointer(x: number, y: number) {
    this.pointer = this.toNdc(x, y);
    this.moved = true;
  }

  clearPointer() {
    this.pointer = null;
  }

  poke(x: number, y: number) {
    if (this.flight?.exit) return;
    this.raycaster.setFromCamera(new THREE.Vector2(...this.toNdc(x, y)), this.camera);
    // The flight ignores a hit until the bird has settled after its entrance.
    if (this.raycaster.intersectObject(this.bird, true).length) this.hit = true;
  }

  startExit(exit: HummingbirdExit) {
    const flight = this.flight;
    if (!flight || flight.exit) return;
    const slot = exit.kind === "landing" ? exit.measure() : null;
    if (exit.kind === "landing" && slot) {
      this.landing = { measure: exit.measure, slot };
      startExit(flight, "land", this.slotTarget(slot));
    } else {
      startExit(flight, "fly-past");
    }
  }

  update(dt: number): HummingbirdFrame {
    this.flight ??= createFlight(this.layout, this.random);
    const flight = this.flight;
    // The slot may still be sliding in with the dashboard entrance.
    if (this.landing && flight.exit) {
      this.landing.slot = this.landing.measure() ?? this.landing.slot;
      setExitTarget(flight, this.slotTarget(this.landing.slot));
    }

    const pose = stepFlight(flight, { pointer: this.pointer, moved: this.moved, hit: this.hit }, dt);
    this.moved = false;
    this.hit = false;
    this.applyPose(pose);
    const exitProgress = pose.exit?.progress ?? 0;
    const touchdown = this.landing ? smooth(LANDING_TOUCHDOWN, 1, exitProgress) : 0;
    if (this.landing) this.applyLandingScale(this.landing.slot, exitProgress);

    this.mixer.update(dt);
    this.applyTail(pose.tail);
    this.ambience.update(dt, flight.t, this.flightRoot, pose.speed, 1 - smooth(0.1, 0.55, exitProgress));
    this.renderer.render(this.scene, this.camera);

    const projected = this.scratch.copy(this.flightRoot.position).project(this.camera);
    return {
      bird: {
        x: ((projected.x + 1) / 2) * this.width,
        y: ((1 - projected.y) / 2) * this.height,
      },
      canvasOpacity: 1 - touchdown,
      presence: smooth(0.35, 1, pose.progress),
      arrived: pose.arrived,
      touchedDown: this.landing !== null && exitProgress >= LANDING_TOUCHDOWN,
      exited: exitProgress >= 1,
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.bird);
    this.release();
  }

  private toNdc(x: number, y: number): [number, number] {
    return [(x / this.width) * 2 - 1, -((y / this.height) * 2 - 1)];
  }

  /** Where the slot's center meets the plane z = 0. */
  private slotTarget(slot: LandingSlot): Vec3 {
    this.raycaster.setFromCamera(new THREE.Vector2(...this.toNdc(slot.x, slot.y)), this.camera);
    this.plane.constant = 0;
    const hit = this.raycaster.ray.intersectPlane(this.plane, this.scratch);
    return hit ? [hit.x, hit.y, hit.z] : [0, 0, 0];
  }

  private applyPose(pose: FlightPose) {
    this.flightRoot.position.set(...pose.position);
    this.euler.set(pose.roll, pose.yaw, pose.pitch, "YZX");
    this.flightRoot.quaternion.setFromEuler(this.euler);
    // Wing effort: hovering and braking beat hard, fast forward flight is easier.
    if (this.flap) this.flap.timeScale = 1.3 + clamp((pose.effort - 1) / 0.7, -0.3, 1);
  }

  /** Shrink from the flight size to the slot's size on the way in. */
  private applyLandingScale(slot: LandingSlot, progress: number) {
    const slotScale = ((slot.height / this.height) * VISIBLE_HEIGHT) / BIRD_HEIGHT * 1.1;
    this.flightRoot.scale.setScalar(
      THREE.MathUtils.lerp(
        this.layout.birdScale,
        slotScale,
        easeInOutCubic(smooth(0.1, 1, progress)),
      ),
    );
  }

  /** Additive on top of the Flap clip's own tail swing, after the mixer has written it. */
  private applyTail(tail: number) {
    if (!this.tail) return;
    this.tail.quaternion.multiply(this.quat.setFromAxisAngle(Z_AXIS, ATTITUDE.tailAngle * tail));
    this.tail.scale.set(1, 1, 1 + TAIL_FAN * tail);
  }
}

export async function createHummingbirdScene({
  canvas,
  model,
  onContextLost,
  random = Math.random,
}: SceneOptions): Promise<HummingbirdScene> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onContextLost();
  };
  const release = () => {
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    disposeObject(scene);
    renderer.dispose();
    // Free the GPU context instead of waiting for garbage collection, but only
    // after two frames without the canvas: losing it in the same task as its
    // last presented frame can flash the screen on some GPU compositors.
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => renderer.forceContextLoss()),
    );
  };
  canvas.addEventListener("webglcontextlost", handleContextLost);

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    addLights(scene);
    const gltf = await new GLTFLoader().parseAsync(model, "");
    return new HummingbirdRuntime(renderer, scene, gltf, random, release);
  } catch (error) {
    release();
    throw error;
  }
}
