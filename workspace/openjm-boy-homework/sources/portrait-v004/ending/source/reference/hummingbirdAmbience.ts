/**
 * Ambient effects around the loader's hummingbird: drifting motes that part
 * around the bird, and a faint trail while it moves quickly. Colors are
 * shader constants from the approved loader preview, not interface tokens.
 */

import * as THREE from "three";

const MOTE_COUNT = 150;
const TRAIL_LENGTH = 60;
const TRAIL_SPEED = 0.45;
/** The motes fade in over this long; the bird itself is never faded in. */
const MOTES_FADE_SECONDS = 0.5;
const MOTE_COLORS = ["#19d18c", "#5fd3c5", "#e7b863", "#8fb8ff"];
const TRAIL_COLORS = ["#19d18c", "#e7b863"] as const;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function pointsMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPR: { value: 1 }, uOpacity: { value: 1 } },
    vertexShader: `
      attribute float aAlpha; attribute float aSize; attribute vec3 aColor;
      uniform float uPR; uniform float uOpacity;
      varying float vA; varying vec3 vC;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPR * (9.0 / max(0.5, -mv.z));
        vA = aAlpha * uOpacity; vC = aColor;
      }`,
    fragmentShader: `
      varying float vA; varying vec3 vC;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vC, a * a * vA);
      }`,
  });
}

function createPoints(count: number, colors: Float32Array) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(count), 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(count), 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(geometry, pointsMaterial());
  points.frustumCulled = false;
  return points;
}

const attribute = (points: THREE.Points, name: string) =>
  points.geometry.getAttribute(name) as THREE.BufferAttribute;

export class LoaderAmbience {
  private readonly motes: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly trail: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly moteVelocity = new Float32Array(MOTE_COUNT * 2);
  private readonly moteAlpha = new Float32Array(MOTE_COUNT);
  private readonly motePush = new Float32Array(MOTE_COUNT * 3);
  private readonly trailPoints: Array<{ position: THREE.Vector3; life: number }> = [];

  constructor(scene: THREE.Scene) {
    const rand = THREE.MathUtils.randFloat;
    const palette = MOTE_COLORS.map((value) => new THREE.Color(value));
    const moteColors = new Float32Array(MOTE_COUNT * 3);
    for (let i = 0; i < MOTE_COUNT; i += 1) {
      const c = palette[i % palette.length];
      moteColors.set([c.r, c.g, c.b], i * 3);
    }
    this.motes = createPoints(MOTE_COUNT, moteColors);

    const position = attribute(this.motes, "position");
    const size = attribute(this.motes, "aSize");
    for (let i = 0; i < MOTE_COUNT; i += 1) {
      position.setXYZ(
        i,
        THREE.MathUtils.randFloatSpread(16),
        THREE.MathUtils.randFloatSpread(9),
        rand(-9, 3),
      );
      this.moteAlpha[i] = rand(0.12, 0.5);
      size.setX(i, rand(1.5, 5));
      this.moteVelocity.set([rand(-0.04, 0.07), rand(0.02, 0.08)], i * 2);
    }

    const head = new THREE.Color(TRAIL_COLORS[0]);
    const tail = new THREE.Color(TRAIL_COLORS[1]);
    const trailColors = new Float32Array(TRAIL_LENGTH * 3);
    for (let i = 0; i < TRAIL_LENGTH; i += 1) {
      const c = head.clone().lerp(tail, i / TRAIL_LENGTH);
      trailColors.set([c.r, c.g, c.b], i * 3);
    }
    this.trail = createPoints(TRAIL_LENGTH, trailColors);
    scene.add(this.motes, this.trail);
  }

  setPointScale(scale: number) {
    this.motes.material.uniforms.uPR.value = scale;
    this.trail.material.uniforms.uPR.value = scale;
  }

  /** `fade` is the ambience opacity; `t` is flight time for the fade-in. */
  update(dt: number, t: number, bird: THREE.Object3D, speed: number, fade: number) {
    this.updateMotes(dt, t, bird.position, speed);
    this.motes.material.uniforms.uOpacity.value = fade;
    this.updateTrail(dt, bird, speed);
  }

  /** Motes drift upward and part around the bird. */
  private updateMotes(dt: number, t: number, bird: THREE.Vector3, speed: number) {
    const position = attribute(this.motes, "position");
    const alpha = attribute(this.motes, "aAlpha");
    const push = this.motePush;
    const wake = 0.4 + speed * 2.2;

    for (let i = 0; i < MOTE_COUNT; i += 1) {
      const p = i * 3;
      let x = position.getX(i) - push[p] + this.moteVelocity[i * 2] * dt;
      let y = position.getY(i) - push[p + 1] + this.moteVelocity[i * 2 + 1] * dt;
      const z = position.getZ(i) - push[p + 2];
      if (y > 4.8) y = -4.8;
      if (x > 8.5) x = -8.5;
      const dx = x - bird.x;
      const dy = y - bird.y;
      const dz = z - bird.z;
      const d = Math.hypot(dx, dy, dz);
      if (d < 1.5 && d > 0.001) {
        const f = ((1.5 - d) / 1.5) * wake * dt;
        push[p] += (dx / d) * f;
        push[p + 1] += (dy / d) * f;
        push[p + 2] += (dz / d) * f;
      }
      push[p] *= 0.97;
      push[p + 1] *= 0.97;
      push[p + 2] *= 0.97;
      position.setXYZ(i, x + push[p], y + push[p + 1], z + push[p + 2]);
      alpha.setX(i, this.moteAlpha[i] * smooth(0, MOTES_FADE_SECONDS, t));
    }
    position.needsUpdate = true;
    alpha.needsUpdate = true;
  }

  private updateTrail(dt: number, bird: THREE.Object3D, speed: number) {
    const points = this.trailPoints;
    if (speed > TRAIL_SPEED) {
      points.unshift({
        position: bird.position.clone().add(new THREE.Vector3(0, -0.3 * bird.scale.x, 0)),
        life: 1,
      });
    }
    for (const point of points) point.life -= dt * 2.2;
    while (
      points.length &&
      (points.length > TRAIL_LENGTH || points[points.length - 1].life <= 0)
    ) {
      points.pop();
    }

    const position = attribute(this.trail, "position");
    const alpha = attribute(this.trail, "aAlpha");
    const size = attribute(this.trail, "aSize");
    for (let i = 0; i < TRAIL_LENGTH; i += 1) {
      const point = points[i];
      const life = point ? Math.max(0, point.life) : 0;
      if (point) position.setXYZ(i, point.position.x, point.position.y, point.position.z);
      alpha.setX(i, life * 0.45);
      size.setX(i, 2 + 4 * life);
    }
    position.needsUpdate = true;
    alpha.needsUpdate = true;
    size.needsUpdate = true;
  }
}
