/* Retained OpenJM source. Compiled deterministically; see native-provenance.json. */
(function(){const modules={},cache={};
modules["morph/engine/audioReaction"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactPointToAudio = reactPointToAudio;
exports.resolveAudioAmount = resolveAudioAmount;
exports.readAudioReaction = readAudioReaction;
exports.advanceReactiveMotion = advanceReactiveMotion;
const motion_1 = require("./motion");
const shapes_1 = require("./shapes");
const CORE_BASS_SWELL = 0.32;
const CORE_PULSE_SWELL = 0.22;
const CORE_BOIL = 0.12;
const RAY_MIN_LENGTH = 0.08;
const RAY_BAND_REACH = 0.62;
const RAY_BASS_REACH = 0.08;
const RAY_PULSE_REACH = 0.1;
const RAY_TIP_GROWTH = 1.1;
const RAY_QUIET_FADE = 0.45;
const RAY_DEPTH_SWAY = 0.08;
const WAVE_SPEED = 0.37;
const WAVE_PULSE_GROWTH = 0.5;
const LEVEL_SPEED_BOOST = 1.5;
function fraction(value) {
    return value - Math.floor(value);
}
/**
 * Spectrum band under a planar position. Bass sits at the bottom of the bloom
 * and treble at the top, mirrored left and right; the angle comes from the
 * point's own position because cached points are not stored in shape order.
 */
function sampleAudioBand(x, y, spectrum) {
    const lastBand = spectrum.length - 1;
    if (lastBand < 0) {
        return 0;
    }
    // Screen +y points down, so an angle of 0 is the bottom of the bloom.
    const position = (Math.abs(Math.atan2(x, y)) / Math.PI) * lastBand;
    const lower = Math.floor(position);
    const upper = Math.min(lastBand, lower + 1);
    const weight = position - lower;
    return spectrum[lower] * (1 - weight) + spectrum[upper] * weight;
}
/**
 * Where a bloom point is drawn while music plays. The core swells with bass
 * and beats, each ray stretches to its spectrum band, and the rings travel
 * outward as shockwaves whose pace follows loudness through its clock. Every
 * change is scaled by the reaction amount, so amount 0 is the rest shape.
 */
function reactPointToAudio(point, reaction, pulse) {
    const { amount, frame, time } = reaction;
    const rest = { x: point.origX, y: point.origY, z: point.origZ, sizeScale: 1, opacityScale: 1 };
    const coreSwell = frame.bass * CORE_BASS_SWELL + pulse * CORE_PULSE_SWELL;
    if (point.part === "core") {
        const boil = Math.sin(point.theta * 5 + point.phiZ * 3 + time * 3) * frame.level * CORE_BOIL;
        const scale = 1 + amount * (coreSwell + boil);
        return {
            ...rest,
            x: point.origX * scale,
            y: point.origY * scale,
            z: point.origZ * scale,
            sizeScale: 1 + amount * frame.bass * 0.4,
        };
    }
    const radius = Math.hypot(point.origX, point.origY);
    if (radius < 0.0001) {
        return rest;
    }
    if (point.part === "ray") {
        const { rayRoot, rayRestLength } = shapes_1.BLOOM_GEOMETRY;
        const along = Math.max(0, (radius - rayRoot) / rayRestLength);
        const band = sampleAudioBand(point.origX, point.origY, frame.spectrum);
        const length = RAY_MIN_LENGTH + band * RAY_BAND_REACH + frame.bass * RAY_BASS_REACH + pulse * RAY_PULSE_REACH;
        // Rays stay rooted on the core surface as it swells.
        const reachedRadius = rayRoot * (1 + coreSwell) + along * length;
        const scale = 1 + amount * (reachedRadius / radius - 1);
        const sway = Math.sin(Math.atan2(point.origX, point.origY) * 3 + time * 1.5) * RAY_DEPTH_SWAY * along;
        return {
            x: point.origX * scale,
            y: point.origY * scale,
            z: point.origZ + amount * sway,
            sizeScale: 1 + amount * band * along * RAY_TIP_GROWTH,
            opacityScale: 1 - amount * (1 - band) * Math.min(1, along) * RAY_QUIET_FADE,
        };
    }
    if (point.part === "wave") {
        const { waveInner, waveSpan } = shapes_1.BLOOM_GEOMETRY;
        const restPhase = Math.min(1, Math.max(0, (radius - waveInner) / waveSpan));
        const phase = fraction(restPhase + time * WAVE_SPEED);
        const scale = 1 + (amount * (phase - restPhase) * waveSpan) / radius;
        // Rings are born faint at the core, peak mid-flight and fade at the edge;
        // loud passages and beats make them brighter.
        const envelope = Math.sin(phase * Math.PI) ** 0.8;
        const strength = Math.min(1, 0.3 + frame.level * 0.7 + pulse * 0.4);
        return {
            x: point.origX * scale,
            y: point.origY * scale,
            z: point.origZ,
            sizeScale: 1 + amount * pulse * WAVE_PULSE_GROWTH,
            opacityScale: 1 + amount * (envelope * strength - 1),
        };
    }
    return rest;
}
/**
 * How strongly the visible form reacts to audio: fully in "playing", and
 * blended by the transition progress while entering or leaving it.
 */
function resolveAudioAmount(activeMode, transition) {
    if (!transition) {
        return activeMode === "playing" ? 1 : 0;
    }
    const targetAmount = transition.targetMode === "playing" ? 1 : 0;
    return transition.fromAudioAmount + (targetAmount - transition.fromAudioAmount) * transition.progress;
}
/**
 * Reads the playing song's frame. Pause or end stops the frame source at
 * once, so the last frame is held, with its beat cleared, while the reaction
 * fades out by its amount; otherwise the form would snap back first.
 */
function readAudioReaction(readAudioFrame, nowMs, amount, time, held) {
    if (amount <= 0) {
        held.current = null;
        return undefined;
    }
    const live = readAudioFrame?.(nowMs);
    if (live) {
        held.current = live.beat > 0 ? { ...live, beat: 0 } : live;
    }
    const frame = live ?? held.current;
    return frame ? { frame, amount, time } : undefined;
}
/**
 * Advances motion with loudness-driven speed and starts a size pulse on a
 * beat, the same mechanism as the pointer-down pulse.
 */
function advanceReactiveMotion(motion, deltaSeconds, params, reaction, beatPulseForce) {
    if (!reaction) {
        return (0, motion_1.advanceMorphMotion)(motion, deltaSeconds, params);
    }
    const speedScale = 1 + reaction.frame.level * LEVEL_SPEED_BOOST * reaction.amount;
    const advanced = (0, motion_1.advanceMorphMotion)(motion, deltaSeconds, params, speedScale);
    if (reaction.frame.beat <= 0) {
        return advanced;
    }
    return {
        ...advanced,
        pulse: Math.max(advanced.pulse, beatPulseForce * reaction.frame.beat * reaction.amount),
    };
}

};
modules["morph/engine/colors"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHex = normalizeHex;
exports.hexToRgb = hexToRgb;
exports.rgbToHex = rgbToHex;
exports.mixRgb = mixRgb;
exports.lerpHexColor = lerpHexColor;
exports.rgbString = rgbString;
const math_1 = require("./math");
function normalizeHex(hex) {
    const cleaned = hex.trim().replace("#", "");
    const expanded = cleaned.length === 3
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
function hexToRgb(hex) {
    const normalized = normalizeHex(hex).slice(1);
    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    };
}
function rgbToHex(color) {
    const value = (1 << 24) |
        ((0, math_1.clamp)(Math.round(color.r), 0, 255) << 16) |
        ((0, math_1.clamp)(Math.round(color.g), 0, 255) << 8) |
        (0, math_1.clamp)(Math.round(color.b), 0, 255);
    return `#${value.toString(16).slice(1)}`;
}
function mixRgb(start, end, amount) {
    const t = (0, math_1.clamp)(amount, 0, 1);
    return {
        r: Math.round((0, math_1.lerp)(start.r, end.r, t)),
        g: Math.round((0, math_1.lerp)(start.g, end.g, t)),
        b: Math.round((0, math_1.lerp)(start.b, end.b, t)),
    };
}
function lerpHexColor(start, end, amount) {
    return rgbToHex(mixRgb(hexToRgb(start), hexToRgb(end), amount));
}
function rgbString(color) {
    return `${color.r}, ${color.g}, ${color.b}`;
}

};
modules["morph/engine/defaults"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_HELIX_SETTINGS = exports.DEFAULT_CLOUD_SETTINGS = exports.DEFAULT_MORPH_PARAMS = void 0;
exports.cloneMorphParams = cloneMorphParams;
exports.createTimelineState = createTimelineState;
exports.createDefaultMorphPreset = createDefaultMorphPreset;
exports.DEFAULT_MORPH_PARAMS = {
    shape: "sphere",
    color1: "#00ffc8",
    color2: "#ff0077",
    backgroundColor: "#000000",
    figureOpacity: 1,
    points: 1500,
    size: 2,
    sphereRadius: 0.3,
    trail: 1,
    moveX: 0,
    moveY: 0,
    moveZ: 0,
    speed: 0.03,
    morph: 0.25,
    rotX: 0.2,
    rotY: 0.3,
    pulseForce: 3,
    pulseDecay: 0.92,
    sizeImpact: 2,
    speedImpact: 0.05,
};
exports.DEFAULT_CLOUD_SETTINGS = {
    spread: 2.2,
    chaos: 0.8,
    pointSize: 0.75,
    pointAmount: 1,
    objectScale: 1,
    shape: "sphere",
    vortexStrength: 0.6,
    vortexSpeed: 1.2,
};
exports.DEFAULT_HELIX_SETTINGS = {
    direction: "forward",
    angle: 0,
    axisX: 0,
    axisY: 1,
    axisZ: 0,
    autoOrbit: false,
    tunnel: 0,
    thickness: 1,
    loops: 4.3,
    cloud: false,
    cloudIntensity: 0.8,
    drawDirection: "forward",
};
function cloneMorphParams(params) {
    return { ...params };
}
function createTimelineState(id, name, params, duration = 2.5) {
    return {
        id,
        name,
        duration,
        data: cloneMorphParams(params),
        transitionEase: "smooth",
        transitionEffect: "direct",
        cloud: { ...exports.DEFAULT_CLOUD_SETTINGS },
        helix: { ...exports.DEFAULT_HELIX_SETTINGS },
    };
}
function createDefaultMorphPreset() {
    return {
        version: "morph-preset-v1",
        name: "OpenJM morph workspace",
        params: cloneMorphParams(exports.DEFAULT_MORPH_PARAMS),
        timeline: [],
        duration: 5,
        loop: true,
    };
}

};
modules["morph/engine/math"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.lerp = lerp;
exports.applyTransitionEasing = applyTransitionEasing;
exports.seededNoise = seededNoise;
exports.getMoveZScale = getMoveZScale;
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function lerp(start, end, amount) {
    return (1 - amount) * start + amount * end;
}
function applyTransitionEasing(raw, easing) {
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
function seededNoise(index, salt) {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
}
function getMoveZScale(value) {
    return 25 ** (clamp(value, -100, 100) / 100);
}

};
modules["morph/engine/motion"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMorphMotionState = createMorphMotionState;
exports.advanceMorphMotion = advanceMorphMotion;
exports.interpolateMorphAngle = interpolateMorphAngle;
exports.interpolateMorphMotion = interpolateMorphMotion;
const math_1 = require("./math");
const LEGACY_FRAME_RATE = 60;
const TAU = Math.PI * 2;
function createMorphMotionState() {
    return { visualTime: 0, rotationX: 0, rotationY: 0, pulse: 0 };
}
function advanceMorphMotion(state, deltaSeconds, params, speedScale = 1) {
    const delta = Math.max(0, deltaSeconds);
    const visualDelta = delta * params.speed * speedScale * LEGACY_FRAME_RATE;
    const pulse = state.pulse * Math.pow(params.pulseDecay, delta * LEGACY_FRAME_RATE);
    return {
        visualTime: state.visualTime + visualDelta,
        rotationX: state.rotationX + visualDelta * params.rotX,
        rotationY: state.rotationY + visualDelta * params.rotY,
        pulse,
    };
}
function normalizeAngle(angle) {
    return ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
}
function interpolateMorphAngle(fromAngle, toAngle, progress) {
    const shortestDelta = normalizeAngle(toAngle - fromAngle);
    return normalizeAngle(fromAngle + shortestDelta * (0, math_1.clamp)(progress, 0, 1));
}
function interpolateMorphMotion(from, to, progress) {
    const amount = (0, math_1.clamp)(progress, 0, 1);
    return {
        visualTime: from.visualTime + (to.visualTime - from.visualTime) * amount,
        rotationX: interpolateMorphAngle(from.rotationX, to.rotationX, amount),
        rotationY: interpolateMorphAngle(from.rotationY, to.rotationY, amount),
        pulse: from.pulse + (to.pulse - from.pulse) * amount,
    };
}

};
modules["morph/engine/orchestration"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimelineProgress = getTimelineProgress;
exports.getElapsedFromProgress = getElapsedFromProgress;
exports.createMorphBridgeFrame = createMorphBridgeFrame;
const defaults_1 = require("./defaults");
const math_1 = require("./math");
const timeline_1 = require("./timeline");
function getTimelineProgress(elapsedSeconds, states, loop) {
    const totalDuration = (0, timeline_1.getTimelineDuration)(states);
    if (totalDuration <= 0) {
        return 0;
    }
    const normalizedElapsed = loop
        ? ((elapsedSeconds % totalDuration) + totalDuration) % totalDuration
        : (0, math_1.clamp)(elapsedSeconds, 0, totalDuration);
    return (0, math_1.clamp)(normalizedElapsed / totalDuration, 0, 1);
}
function getElapsedFromProgress(states, progress) {
    const totalDuration = (0, timeline_1.getTimelineDuration)(states);
    if (totalDuration <= 0) {
        return 0;
    }
    return (0, math_1.clamp)(progress, 0, 1) * totalDuration;
}
function createBridgeState(label, params) {
    return (0, defaults_1.createTimelineState)(`bridge-${label}`, `Bridge ${label}`, params, 1);
}
function getAnchoredBridgeParams(from, to, amount) {
    const interpolated = (0, timeline_1.interpolateParams)(from, to, amount);
    return {
        ...interpolated,
        points: Math.max(from.points, to.points),
        moveX: from.moveX,
        moveY: from.moveY,
        moveZ: from.moveZ,
    };
}
function createMorphBridgeFrame(fromFrame, toFrame, progress) {
    const t = (0, math_1.clamp)(progress, 0, 1);
    return {
        params: getAnchoredBridgeParams(fromFrame.params, toFrame.params, t),
        fromState: createBridgeState("source", fromFrame.params),
        toState: createBridgeState("target", toFrame.params),
        progress: t,
    };
}

};
modules["morph/engine/preset"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMorphPreset = normalizeMorphPreset;
const defaults_1 = require("./defaults");
function normalizeTimelineState(state, index, createStateId) {
    return {
        id: typeof state.id === "string" ? state.id : createStateId(index),
        name: typeof state.name === "string" ? state.name : `State ${index + 1}`,
        duration: typeof state.duration === "number" ? state.duration : 2.5,
        data: { ...defaults_1.DEFAULT_MORPH_PARAMS, ...state.data },
        transitionEase: state.transitionEase ?? "smooth",
        transitionEffect: state.transitionEffect ?? "direct",
        cloud: { ...defaults_1.DEFAULT_CLOUD_SETTINGS, ...state.cloud },
        helix: { ...defaults_1.DEFAULT_HELIX_SETTINGS, ...state.helix },
    };
}
function normalizeMorphPreset(value, createStateId) {
    if (!value || typeof value !== "object") {
        return null;
    }
    const candidate = value;
    if (!candidate.params || typeof candidate.params !== "object") {
        return null;
    }
    return {
        version: "morph-preset-v1",
        name: typeof candidate.name === "string" ? candidate.name : "Imported morph workspace",
        params: { ...defaults_1.DEFAULT_MORPH_PARAMS, ...candidate.params },
        timeline: Array.isArray(candidate.timeline)
            ? candidate.timeline.map((state, index) => normalizeTimelineState(state, index, createStateId))
            : [],
        duration: typeof candidate.duration === "number" ? candidate.duration : 5,
        loop: typeof candidate.loop === "boolean" ? candidate.loop : true,
    };
}

};
modules["morph/engine/renderMorphFrame"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMorphBridgeTargetSnapshot = createMorphBridgeTargetSnapshot;
exports.createMorphParticleSnapshot = createMorphParticleSnapshot;
exports.renderMorphFrame = renderMorphFrame;
const audioReaction_1 = require("./audioReaction");
const colors_1 = require("./colors");
const math_1 = require("./math");
const shapes_1 = require("./shapes");
function getParticleCloudAmount(progress) {
    return 1 - Math.abs((0, math_1.clamp)(progress, 0, 1) * 2 - 1);
}
function easeParticleTraversal(amount) {
    const t = (0, math_1.clamp)(amount, 0, 1);
    return t * t * (3 - 2 * t);
}
function getCachedShapePoints(cache, shape, points) {
    const safePoints = Math.max(1, Math.floor(points));
    const key = `${shape}-${safePoints}`;
    const cached = cache.get(key);
    if (cached) {
        return cached;
    }
    const next = (0, shapes_1.generateShapePoints)(shape, safePoints).sort((pointA, pointB) => {
        const bandA = Math.round((pointA.origY + 1.5) * 18);
        const bandB = Math.round((pointB.origY + 1.5) * 18);
        if (bandA !== bandB) {
            return bandA - bandB;
        }
        if (pointA.origX !== pointB.origX) {
            return pointA.origX - pointB.origX;
        }
        return pointA.origZ - pointB.origZ;
    });
    cache.set(key, next);
    return next;
}
function buildHelixBasis(settings) {
    let ax = settings.axisX;
    let ay = settings.axisY;
    let az = settings.axisZ * 2.5;
    let axisLength = Math.sqrt(ax * ax + ay * ay + az * az);
    if (!Number.isFinite(axisLength) || axisLength < 0.0001) {
        ax = 0;
        ay = 1;
        az = 0;
        axisLength = 1;
    }
    ax /= axisLength;
    ay /= axisLength;
    az /= axisLength;
    let helperX = Math.abs(ay) < 0.9 ? 0 : 1;
    let helperY = Math.abs(ay) < 0.9 ? 1 : 0;
    let helperZ = 0;
    let ux = helperY * az - helperZ * ay;
    let uy = helperZ * ax - helperX * az;
    let uz = helperX * ay - helperY * ax;
    let uLength = Math.sqrt(ux * ux + uy * uy + uz * uz);
    if (!Number.isFinite(uLength) || uLength < 0.0001) {
        helperX = 0;
        helperY = 0;
        helperZ = 1;
        ux = helperY * az - helperZ * ay;
        uy = helperZ * ax - helperX * az;
        uz = helperX * ay - helperY * ax;
        uLength = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;
    }
    ux /= uLength;
    uy /= uLength;
    uz /= uLength;
    const vx = ay * uz - az * uy;
    const vy = az * ux - ax * uz;
    const vz = ax * uy - ay * ux;
    const angle = (settings.angle || 0) * (Math.PI / 180);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return {
        axis: { x: ax, y: ay, z: az },
        u: {
            x: ux * cosA + vx * sinA,
            y: uy * cosA + vy * sinA,
            z: uz * cosA + vz * sinA,
        },
        v: {
            x: -ux * sinA + vx * cosA,
            y: -uy * sinA + vy * cosA,
            z: -uz * sinA + vz * cosA,
        },
    };
}
function getHelixPoint(index, sourceState, timeValue, isDoubleHelix, traversalProgress) {
    const settings = sourceState.cloud;
    const helix = sourceState.helix;
    const baseScale = settings.spread * settings.objectScale;
    const basis = buildHelixBasis(helix);
    const directionSign = helix.direction === "reverse" ? -1 : 1;
    const drawDirectionSign = helix.drawDirection === "reverse" ? -1 : 1;
    const tunnelAmount = (0, math_1.clamp)(helix.tunnel, 0, 2);
    const screwSpinSpeed = 0.4 + settings.vortexSpeed * 0.35;
    const loopCount = (0, math_1.clamp)(helix.loops, 1, 12);
    const rungCount = Math.max(10, Math.round(loopCount * 3.4));
    const roleNoise = (0, math_1.seededNoise)(index, 17);
    const isBridgeAtom = isDoubleHelix && roleNoise < 0.34;
    const cloudDrive = helix.cloud ? Math.pow((0, math_1.clamp)(helix.cloudIntensity / 2, 0, 1), 1.15) : 0;
    const rawHeightProgress = (0, math_1.clamp)(traversalProgress, 0, 1);
    const heightProgress = isBridgeAtom ? (Math.floor(rawHeightProgress * rungCount) + 0.5) / rungCount : rawHeightProgress;
    const drawHeightProgress = drawDirectionSign === -1 ? 1 - heightProgress : heightProgress;
    const axialOffset = (drawHeightProgress * 2 - 1) * baseScale * 1.45;
    const strandFlipped = isDoubleHelix && !isBridgeAtom && (0, math_1.seededNoise)(index, 19) < 0.5;
    const strandPhase = strandFlipped ? Math.PI : 0;
    const strandProgress = strandFlipped ? 1 - drawHeightProgress : drawHeightProgress;
    const helixPhase = directionSign * (strandProgress * Math.PI * 2 * loopCount + timeValue * screwSpinSpeed) + strandPhase;
    const helixRadius = baseScale * (isDoubleHelix ? 0.34 : 0.4) * (1 + tunnelAmount * 0.42);
    const radialX = Math.cos(helixPhase) * basis.u.x + Math.sin(helixPhase) * basis.v.x;
    const radialY = Math.cos(helixPhase) * basis.u.y + Math.sin(helixPhase) * basis.v.y;
    const radialZ = Math.cos(helixPhase) * basis.u.z + Math.sin(helixPhase) * basis.v.z;
    const tangentX = -Math.sin(helixPhase) * basis.u.x + Math.cos(helixPhase) * basis.v.x;
    const tangentY = -Math.sin(helixPhase) * basis.u.y + Math.cos(helixPhase) * basis.v.y;
    const tangentZ = -Math.sin(helixPhase) * basis.u.z + Math.cos(helixPhase) * basis.v.z;
    const cloudOrbitPhase = helixPhase * (0.82 + cloudDrive * 0.12) +
        timeValue * (0.75 + cloudDrive * 0.55) +
        ((0, math_1.seededNoise)(index, 24) - 0.5) * Math.PI * 2.25;
    const cloudOrbitRadius = helixRadius *
        (0.34 + cloudDrive * 0.62) *
        (0.9 + 0.18 * Math.sin(drawHeightProgress * Math.PI * 2.6 + (0, math_1.seededNoise)(index, 25) * Math.PI * 2));
    const cloudOrbitX = Math.cos(cloudOrbitPhase) * basis.u.x + Math.sin(cloudOrbitPhase) * basis.v.x;
    const cloudOrbitY = Math.cos(cloudOrbitPhase) * basis.u.y + Math.sin(cloudOrbitPhase) * basis.v.y;
    const cloudOrbitZ = Math.cos(cloudOrbitPhase) * basis.u.z + Math.sin(cloudOrbitPhase) * basis.v.z;
    const cloudAxisDrift = helix.cloud
        ? Math.sin(cloudOrbitPhase * 0.7 + (0, math_1.seededNoise)(index, 26) * Math.PI * 2) * baseScale * (0.12 + cloudDrive * 0.13)
        : 0;
    const bridgeSide = isBridgeAtom ? ((0, math_1.seededNoise)(index, 20) < 0.5 ? -1 : 1) : 1;
    const radialScale = isBridgeAtom ? bridgeSide * (0.22 + (0, math_1.seededNoise)(index, 31) * 0.08) : 1;
    const thickness = baseScale * (isBridgeAtom ? 0.01 : 0.018) * (1 + settings.chaos * 0.65) * (0, math_1.clamp)(helix.thickness, 0.2, 25);
    const radialJitter = ((0, math_1.seededNoise)(index, 21) * 2 - 1) * thickness;
    const tangentJitter = ((0, math_1.seededNoise)(index, 22) * 2 - 1) * thickness;
    const axialJitter = ((0, math_1.seededNoise)(index, 23) * 2 - 1) * thickness * 0.45;
    const bridgeTightness = isBridgeAtom ? 0.45 : 1;
    const cloudRadialJitter = helix.cloud
        ? ((0, math_1.seededNoise)(index, 30) * 2 - 1) * baseScale * (0.1 + cloudDrive * 0.12) * bridgeTightness
        : 0;
    const activeRadius = helix.cloud ? helixRadius * (0.92 + cloudDrive * 0.22) : helixRadius;
    const cloudRadius = activeRadius * radialScale + radialJitter + cloudRadialJitter + cloudOrbitRadius * (helix.cloud ? 0.58 + cloudDrive * 0.28 : 0);
    const x = basis.axis.x * (axialOffset + cloudAxisDrift * bridgeTightness) +
        radialX * cloudRadius +
        cloudOrbitX * cloudOrbitRadius +
        tangentX * tangentJitter +
        basis.axis.x * axialJitter;
    const y = basis.axis.y * (axialOffset + cloudAxisDrift * bridgeTightness) +
        radialY * cloudRadius +
        cloudOrbitY * cloudOrbitRadius +
        tangentY * tangentJitter +
        basis.axis.y * axialJitter;
    const z = basis.axis.z * (axialOffset + cloudAxisDrift * bridgeTightness) +
        radialZ * cloudRadius +
        cloudOrbitZ * cloudOrbitRadius +
        tangentZ * tangentJitter +
        basis.axis.z * axialJitter;
    const radius = Math.sqrt(x * x + y * y + z * z) || 1;
    return {
        origX: x,
        origY: y,
        origZ: z,
        theta: Math.atan2(z, x),
        phiZ: Math.acos((0, math_1.clamp)(y / radius, -1, 1)),
    };
}
function resolvePointForTransition(index, fromPoint, toPoint, options) {
    const fromState = options.fromState;
    const progress = options.transitionProgress ?? 0;
    if (!fromState) {
        return fromPoint;
    }
    if (fromState.transitionEffect === "particle-cloud") {
        const cloudPoint = (0, shapes_1.getParticleCloudPoint)(index, fromState.cloud, options.time);
        const cloudPhase = progress < 0.5 ? progress * 2 : (progress - 0.5) * 2;
        return progress < 0.5
            ? (0, shapes_1.blendPoint)(fromPoint, cloudPoint, cloudPhase)
            : (0, shapes_1.blendPoint)(cloudPoint, toPoint, cloudPhase);
    }
    if (fromState.transitionEffect === "helix" || fromState.transitionEffect === "double-helix") {
        const traversalDelay = (index / Math.max(1, Math.max(fromState.data.points, options.params.points) - 1)) * 0.28;
        const traversalProgress = progress >= traversalDelay + 0.72 ? 1 : (0, math_1.clamp)((progress - traversalDelay) / 0.72, 0, 1);
        const entryBlend = easeParticleTraversal((0, math_1.clamp)(traversalProgress / 0.16, 0, 1));
        const exitStart = 0.82 + traversalDelay * 0.28;
        const exitBlend = easeParticleTraversal((0, math_1.clamp)((progress - exitStart) / Math.max(0.001, 1 - exitStart), 0, 1));
        const helixPoint = getHelixPoint(index, fromState, options.time, fromState.transitionEffect === "double-helix", traversalProgress);
        return (0, shapes_1.blendPoint)((0, shapes_1.blendPoint)(fromPoint, helixPoint, entryBlend), toPoint, exitBlend);
    }
    return (0, shapes_1.blendPoint)(fromPoint, toPoint, progress);
}
function resolveDensityTransition(index, fromPoints, toPoints, options) {
    const sourcePointCount = options.fromState?.data.points ?? options.params.points;
    const targetPointCount = options.toState?.data.points ?? options.params.points;
    const progress = options.transitionProgress ?? 0;
    const fromPoint = fromPoints[index];
    const toPoint = toPoints[index];
    if (index < Math.min(sourcePointCount, targetPointCount)) {
        return {
            point: resolvePointForTransition(index, fromPoint, toPoint, options),
            opacity: 1,
            sizeScale: 1,
        };
    }
    if (targetPointCount > sourcePointCount) {
        const sourceIndex = Math.min(sourcePointCount - 1, Math.floor((index * sourcePointCount) / targetPointCount));
        const sourceAnchor = fromPoints[sourceIndex];
        return {
            point: resolvePointForTransition(index, sourceAnchor, toPoint, options),
            opacity: progress,
            sizeScale: 1,
        };
    }
    if (sourcePointCount > targetPointCount) {
        const targetIndex = Math.min(targetPointCount - 1, Math.floor((index * targetPointCount) / sourcePointCount));
        const targetAnchor = toPoints[targetIndex];
        return {
            point: resolvePointForTransition(index, fromPoint, targetAnchor, options),
            opacity: 1 - progress,
            sizeScale: 1,
        };
    }
    return {
        point: resolvePointForTransition(index, fromPoint, toPoint, options),
        opacity: 1,
        sizeScale: 1,
    };
}
function resolveSnapshotDensityTransition(index, sourceSnapshot, toPoints, targetPointCount, progress) {
    const sourcePointCount = sourceSnapshot.samples.length;
    const sourceSample = sourceSnapshot.samples[index];
    const toPoint = toPoints[index];
    if (index < Math.min(sourcePointCount, targetPointCount)) {
        return {
            point: (0, shapes_1.blendPoint)(sourceSample.point, toPoint, progress),
            opacity: (0, math_1.lerp)(sourceSample.opacity, 1, progress),
            sizeScale: (0, math_1.lerp)(sourceSample.sizeScale, 1, progress),
        };
    }
    if (targetPointCount > sourcePointCount) {
        const sourceIndex = Math.min(sourcePointCount - 1, Math.floor((index * sourcePointCount) / targetPointCount));
        const sourceAnchor = sourceSnapshot.samples[sourceIndex];
        return {
            point: (0, shapes_1.blendPoint)(sourceAnchor.point, toPoint, progress),
            opacity: progress,
            sizeScale: (0, math_1.lerp)(sourceAnchor.sizeScale, 1, progress),
        };
    }
    const targetIndex = Math.min(targetPointCount - 1, Math.floor((index * targetPointCount) / sourcePointCount));
    return {
        point: (0, shapes_1.blendPoint)(sourceSample.point, toPoints[targetIndex], progress),
        opacity: sourceSample.opacity * (1 - progress),
        sizeScale: sourceSample.sizeScale,
    };
}
function distanceSquared(pointA, pointB) {
    const deltaX = pointA.origX - pointB.origX;
    const deltaY = pointA.origY - pointB.origY;
    const deltaZ = pointA.origZ - pointB.origZ;
    return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
}
function findClosestSampleIndex(point, samples, available) {
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < samples.length; index += 1) {
        if (available && !available[index]) {
            continue;
        }
        const distance = distanceSquared(point, samples[index].point);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    }
    return closestIndex;
}
function createMorphBridgeTargetSnapshot({ sourceSnapshot, ...targetOptions }) {
    const targetSnapshot = createMorphParticleSnapshot({
        ...targetOptions,
        sourceSnapshot: null,
    });
    const sourceSamples = sourceSnapshot.samples;
    const targetSamples = targetSnapshot.samples;
    if (sourceSamples.length === targetSamples.length) {
        return targetSnapshot;
    }
    if (sourceSamples.length < targetSamples.length) {
        const availableTargets = targetSamples.map(() => true);
        const mappedTargets = sourceSamples.map((sourceSample, sourceIndex) => {
            const targetIndex = findClosestSampleIndex(sourceSample.point, targetSamples, availableTargets);
            availableTargets[targetIndex] = false;
            return {
                ...targetSamples[targetIndex],
                sourceIndex,
                finalOpacity: 1,
            };
        });
        const addedTargets = targetSamples.flatMap((targetSample, targetIndex) => {
            if (availableTargets[targetIndex]) {
                return [{
                        ...targetSample,
                        sourceIndex: findClosestSampleIndex(targetSample.point, sourceSamples),
                        finalOpacity: 1,
                    }];
            }
            return [];
        });
        return { samples: [...mappedTargets, ...addedTargets] };
    }
    const availableSources = sourceSamples.map(() => true);
    const samples = sourceSamples.map((sourceSample, sourceIndex) => ({
        point: sourceSample.point,
        opacity: 0,
        sizeScale: sourceSample.sizeScale,
        sourceIndex,
        finalOpacity: 0,
    }));
    for (const targetSample of targetSamples) {
        const sourceIndex = findClosestSampleIndex(targetSample.point, sourceSamples, availableSources);
        availableSources[sourceIndex] = false;
        samples[sourceIndex] = {
            ...targetSample,
            sourceIndex,
            finalOpacity: 1,
        };
    }
    for (let sourceIndex = 0; sourceIndex < samples.length; sourceIndex += 1) {
        if (!availableSources[sourceIndex]) {
            continue;
        }
        const targetIndex = findClosestSampleIndex(sourceSamples[sourceIndex].point, targetSamples);
        samples[sourceIndex] = {
            ...targetSamples[targetIndex],
            sourceIndex,
            finalOpacity: 0,
        };
    }
    return { samples };
}
const MORPH_BRIDGE_STAGGER_SPAN = 0.4;
const MORPH_BRIDGE_BULGE_STRENGTH = 0.32;
function easeMorphBridgeLocal(amount) {
    const t = (0, math_1.clamp)(amount, 0, 1);
    return t * t * (3 - 2 * t);
}
function getMorphBridgeRadialDirection(point, index) {
    const length = Math.sqrt(point.origX * point.origX + point.origY * point.origY + point.origZ * point.origZ);
    if (length > 0.0001) {
        return { x: point.origX / length, y: point.origY / length, z: point.origZ / length };
    }
    // Points that land exactly on the origin have no direction to bulge along -
    // give them a stable, index-seeded one instead of leaving them frozen at
    // the core while everything else puffs outward around them.
    const theta = (0, math_1.seededNoise)(index, 401) * Math.PI * 2;
    const phi = (0, math_1.seededNoise)(index, 402) * Math.PI;
    return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
    };
}
function getMorphEntropyOffset(index, time, salt) {
    const swirl = time * (0.6 + (0, math_1.seededNoise)(index, salt) * 1.6) +
        (0, math_1.seededNoise)(index, salt + 1) * Math.PI * 2;
    const elevation = ((0, math_1.seededNoise)(index, salt + 2) * 2 - 1) * (Math.PI / 2);
    const reach = 0.18 + (0, math_1.seededNoise)(index, salt + 3) * 0.35;
    return {
        x: Math.cos(swirl) * Math.cos(elevation) * reach,
        y: Math.sin(elevation) * reach,
        z: Math.sin(swirl) * Math.cos(elevation) * reach,
    };
}
function resolveBridgeSnapshotTransition(index, sourceSnapshot, targetSnapshot, progress, time) {
    const targetSample = targetSnapshot.samples[index];
    const sourceSample = sourceSnapshot.samples[index] ??
        sourceSnapshot.samples[targetSample.sourceIndex ?? 0];
    const initialOpacity = index < sourceSnapshot.samples.length ? sourceSample.opacity : 0;
    const finalOpacity = targetSample.finalOpacity ?? targetSample.opacity;
    // Every particle used to travel the same straight line in lockstep, which
    // reads as the cloud squeezing through a single point on its way to the
    // next shape. Staggering each particle's departure and bowing its path
    // outward mid-flight turns that into an organic cloud dispersing and
    // re-forming instead.
    const delay = (0, math_1.seededNoise)(index, 401) * MORPH_BRIDGE_STAGGER_SPAN;
    const localProgress = easeMorphBridgeLocal((progress - delay) / Math.max(0.0001, 1 - delay));
    // Particles that only exist on one side of the transition (a target shape
    // with more or fewer points than the source) have no real counterpart to
    // travel from/to - the nearest-match fallback used for their base point
    // clusters many of them onto the same handful of source/target particles,
    // which is what makes big point-count jumps (standby <-> the denser
    // generative shapes, in/out of "image") read so differently from
    // same-density generative-to-generative swaps. Instead of flying them
    // across the scene, materialize/dissolve them in place inside an agitated
    // noise swirl that settles into exact alignment as they fade in (or grows
    // as they fade out).
    const isSpawning = finalOpacity > initialOpacity;
    const isDespawning = finalOpacity < initialOpacity;
    if (isSpawning || isDespawning) {
        const anchorPoint = isSpawning ? targetSample.point : sourceSample.point;
        const entropyProgress = isSpawning ? 1 - localProgress : localProgress;
        const entropyEnvelope = entropyProgress * entropyProgress;
        const entropyOffset = getMorphEntropyOffset(index, time, 411);
        return {
            point: {
                ...anchorPoint,
                origX: anchorPoint.origX + entropyOffset.x * entropyEnvelope,
                origY: anchorPoint.origY + entropyOffset.y * entropyEnvelope,
                origZ: anchorPoint.origZ + entropyOffset.z * entropyEnvelope,
            },
            opacity: (0, math_1.lerp)(initialOpacity, finalOpacity, localProgress),
            sizeScale: (0, math_1.lerp)(sourceSample.sizeScale, targetSample.sizeScale, localProgress),
        };
    }
    const bulgeEnvelope = Math.sin(localProgress * Math.PI);
    const basePoint = (0, shapes_1.blendPoint)(sourceSample.point, targetSample.point, localProgress);
    const travel = Math.hypot(targetSample.point.origX - sourceSample.point.origX, targetSample.point.origY - sourceSample.point.origY, targetSample.point.origZ - sourceSample.point.origZ);
    const direction = getMorphBridgeRadialDirection(basePoint, index);
    const bulgeAmount = bulgeEnvelope * (MORPH_BRIDGE_BULGE_STRENGTH + travel * 0.18);
    return {
        point: {
            ...basePoint,
            origX: basePoint.origX + direction.x * bulgeAmount,
            origY: basePoint.origY + direction.y * bulgeAmount,
            origZ: basePoint.origZ + direction.z * bulgeAmount,
        },
        opacity: (0, math_1.lerp)(initialOpacity, finalOpacity, localProgress),
        sizeScale: (0, math_1.lerp)(sourceSample.sizeScale, targetSample.sizeScale, localProgress),
    };
}
function resolveMorphParticleSamples(options) {
    const { params, time, pointCache, fromState, toState, transitionProgress = 0, sourceSnapshot, targetSnapshot, } = options;
    const transitionEffect = fromState?.transitionEffect ?? "direct";
    if (sourceSnapshot && targetSnapshot) {
        return targetSnapshot.samples.map((_, index) => resolveBridgeSnapshotTransition(index, sourceSnapshot, targetSnapshot, transitionProgress, time));
    }
    const usesCloud = !sourceSnapshot &&
        !!fromState &&
        (transitionEffect === "particle-cloud" ||
            transitionEffect === "helix" ||
            transitionEffect === "double-helix");
    const sourcePointCount = Math.max(1, sourceSnapshot?.samples.length ??
        Math.floor(fromState?.data.points ?? params.points));
    const targetPointCount = Math.max(1, Math.floor(toState?.data.points ?? params.points));
    const maxPoints = usesCloud
        ? Math.max(fromState.data.points, toState?.data.points ?? params.points) *
            fromState.cloud.pointAmount
        : fromState || sourceSnapshot
            ? Math.max(sourcePointCount, targetPointCount)
            : params.points;
    const activeMaxPoints = Math.max(1, Math.floor(maxPoints));
    const fromPoints = sourceSnapshot
        ? []
        : getCachedShapePoints(pointCache, fromState?.data.shape ?? params.shape, usesCloud ? activeMaxPoints : sourcePointCount);
    const toPoints = getCachedShapePoints(pointCache, toState?.data.shape ?? params.shape, usesCloud ? activeMaxPoints : targetPointCount);
    const basePoints = getCachedShapePoints(pointCache, params.shape, activeMaxPoints);
    return Array.from({ length: activeMaxPoints }, (_, index) => {
        if (sourceSnapshot) {
            return resolveSnapshotDensityTransition(index, sourceSnapshot, toPoints, targetPointCount, transitionProgress);
        }
        if (fromState) {
            return resolveDensityTransition(index, fromPoints, toPoints, options);
        }
        return { point: basePoints[index], opacity: 1, sizeScale: 1 };
    });
}
function createMorphParticleSnapshot(options) {
    return { samples: resolveMorphParticleSamples(options) };
}
function renderMorphFrame(options) {
    const { context, width, height, params, time, pulse, fromState, transitionProgress = 0, pointDensityScale = 1, objectScale = 1, pointScale = 1, logicalWidth = width, logicalHeight = height, originX = width / 2, originY = height / 2, audio, } = options;
    const reactsToAudio = !!audio && audio.amount > 0;
    const transitionEffect = fromState?.transitionEffect ?? "direct";
    const usesCloud = !options.sourceSnapshot &&
        !!fromState &&
        (transitionEffect === "particle-cloud" || transitionEffect === "helix" || transitionEffect === "double-helix");
    const particleSamples = resolveMorphParticleSamples(options);
    const activeMaxPoints = particleSamples.length;
    const visibleMaxPoints = Math.max(1, Math.floor(activeMaxPoints * pointDensityScale));
    const sphereSize = Math.min(logicalWidth, logicalHeight) * params.sphereRadius * objectScale;
    const offsetX = params.moveX * sphereSize;
    const offsetY = params.moveY * sphereSize;
    const moveZScale = (0, math_1.getMoveZScale)(params.moveZ);
    const rgbTop = (0, colors_1.hexToRgb)(params.color1);
    const rgbBottom = (0, colors_1.hexToRgb)(params.color2);
    const currentSize = (params.size + pulse * params.sizeImpact) * pointScale;
    const lockHelixOrbit = !!fromState &&
        (transitionEffect === "helix" || transitionEffect === "double-helix") &&
        !fromState.helix.autoOrbit;
    const renderRotX = lockHelixOrbit ? 0 : (options.rotationX ?? time * params.rotX);
    const renderRotY = lockHelixOrbit ? 0 : (options.rotationY ?? time * params.rotY);
    const cloudAmount = usesCloud ? getParticleCloudAmount(transitionProgress) : 0;
    const helixOrderAmount = transitionEffect === "helix" || transitionEffect === "double-helix" ? cloudAmount : 0;
    for (let visibleIndex = 0; visibleIndex < visibleMaxPoints; visibleIndex += 1) {
        const index = visibleMaxPoints === activeMaxPoints
            ? visibleIndex
            : Math.floor((visibleIndex / Math.max(1, visibleMaxPoints - 1)) * (activeMaxPoints - 1));
        const densityTransition = particleSamples[index];
        const sourcePoint = densityTransition.point;
        if (densityTransition.opacity <= 0) {
            continue;
        }
        const morph = Math.sin(sourcePoint.theta * 4 + time * 2) *
            Math.cos(sourcePoint.phiZ * 3 - time) *
            params.morph *
            (1 - helixOrderAmount);
        const audioPoint = reactsToAudio ? (0, audioReaction_1.reactPointToAudio)(sourcePoint, audio, pulse) : null;
        let x = (audioPoint?.x ?? sourcePoint.origX) * (1 + morph);
        let y = (audioPoint?.y ?? sourcePoint.origY) * (1 + morph);
        let z = (audioPoint?.z ?? sourcePoint.origZ) * (1 + morph);
        const y1 = y * Math.cos(renderRotX) - z * Math.sin(renderRotX);
        const z1 = y * Math.sin(renderRotX) + z * Math.cos(renderRotX);
        y = y1;
        z = z1;
        const x1 = x * Math.cos(renderRotY) - z * Math.sin(renderRotY);
        const z2 = x * Math.sin(renderRotY) + z * Math.cos(renderRotY);
        x = x1;
        z = z2;
        const scale = (3 / (3 + z)) * moveZScale;
        const px = originX + x * scale * sphereSize + offsetX;
        const py = originY + y * scale * sphereSize + offsetY;
        const gradientFactor = (0, math_1.clamp)((sourcePoint.origY * -1 + 1) / 2, 0, 1);
        const color = (0, colors_1.mixRgb)(rgbTop, rgbBottom, gradientFactor);
        const baseDrawSize = cloudAmount > 0 && fromState
            ? (0, math_1.lerp)(currentSize, currentSize * fromState.cloud.pointSize, cloudAmount)
            : currentSize;
        const drawSize = baseDrawSize * (audioPoint?.sizeScale ?? 1);
        const opacity = params.figureOpacity * densityTransition.opacity * (audioPoint?.opacityScale ?? 1);
        if (opacity <= 0.005) {
            continue;
        }
        context.fillStyle = `rgba(${(0, colors_1.rgbString)(color)}, ${opacity})`;
        context.beginPath();
        context.arc(px, py, Math.max(0.5, scale * drawSize * densityTransition.sizeScale), 0, Math.PI * 2);
        context.fill();
    }
}

};
modules["morph/engine/shapes"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOOM_GEOMETRY = void 0;
exports.generateShapePoints = generateShapePoints;
exports.getParticleCloudPoint = getParticleCloudPoint;
exports.blendPoint = blendPoint;
const math_1 = require("./math");
function projectToShape(shape, dx, dy, dz) {
    let t = 1;
    if (shape === "cube") {
        t = 1 / Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
    }
    else if (shape === "pyramid") {
        t = Number.POSITIVE_INFINITY;
        if (dy < 0) {
            t = -1 / dy;
        }
        const denomX = dy + 2 * Math.abs(dx);
        const denomZ = dy + 2 * Math.abs(dz);
        if (denomX > 0) {
            t = Math.min(t, 1 / denomX);
        }
        if (denomZ > 0) {
            t = Math.min(t, 1 / denomZ);
        }
        if (!Number.isFinite(t)) {
            t = 1;
        }
    }
    return { x: dx * t, y: dy * t, z: dz * t };
}
function createMorphPoint(x, y, z, part) {
    const distance = Math.sqrt(x * x + y * y + z * z) || 1;
    return {
        origX: x,
        origY: y,
        origZ: z,
        theta: Math.atan2(z, x),
        phiZ: Math.acos((0, math_1.clamp)(y / distance, -1, 1)),
        part,
    };
}
const MUSIC_CURVE_SAMPLES_PER_SEGMENT = 64;
const MUSIC_WAVE_ANCHORS = [
    { x: -1.48, y: 0.01 },
    { x: -1.22, y: -0.05 },
    { x: -0.98, y: 0.26 },
    { x: -0.7, y: -0.27 },
    { x: -0.39, y: 0.25 },
    { x: -0.1, y: -0.04 },
    { x: 0.17, y: 0.2 },
    { x: 0.43, y: -0.18 },
    { x: 0.72, y: 0.23 },
    { x: 0.99, y: -0.23 },
    { x: 1.22, y: 0.17 },
    { x: 1.48, y: -0.01 },
];
const MUSIC_STEM_ANCHORS = [
    { x: 0.12, y: 0.48 },
    { x: 0.08, y: 0.08 },
    { x: 0.1, y: -0.46 },
    { x: 0.05, y: -0.88 },
];
const MUSIC_FLAG_OUTER_SEGMENTS = [
    {
        start: { x: 0.05, y: -0.88 },
        control1: { x: 0.36, y: -0.88 },
        control2: { x: 0.77, y: -0.68 },
        end: { x: 0.8, y: -0.48 },
    },
    {
        start: { x: 0.8, y: -0.48 },
        control1: { x: 0.83, y: -0.34 },
        control2: { x: 0.76, y: -0.2 },
        end: { x: 0.69, y: -0.13 },
    },
];
const MUSIC_FLAG_INNER_SEGMENTS = [
    {
        start: { x: 0.07, y: -0.7 },
        control1: { x: 0.3, y: -0.69 },
        control2: { x: 0.61, y: -0.56 },
        end: { x: 0.66, y: -0.42 },
    },
    {
        start: { x: 0.66, y: -0.42 },
        control1: { x: 0.7, y: -0.31 },
        control2: { x: 0.69, y: -0.2 },
        end: { x: 0.65, y: -0.11 },
    },
];
function createMusicBezierSegments(anchors) {
    return Array.from({ length: anchors.length - 1 }, (_, index) => {
        const previous = anchors[Math.max(0, index - 1)];
        const start = anchors[index];
        const end = anchors[index + 1];
        const next = anchors[Math.min(anchors.length - 1, index + 2)];
        return {
            start,
            control1: {
                x: start.x + (end.x - previous.x) / 6,
                y: start.y + (end.y - previous.y) / 6,
            },
            control2: {
                x: end.x - (next.x - start.x) / 6,
                y: end.y - (next.y - start.y) / 6,
            },
            end,
        };
    });
}
function getMusicBezierPosition(segments, progress) {
    const scaledProgress = (0, math_1.clamp)(progress, 0, 1) * segments.length;
    const segmentIndex = Math.min(segments.length - 1, Math.floor(scaledProgress));
    const segmentProgress = scaledProgress - segmentIndex;
    const segment = segments[segmentIndex];
    return {
        x: getCubicBezierCoordinate(segment.start.x, segment.control1.x, segment.control2.x, segment.end.x, segmentProgress),
        y: getCubicBezierCoordinate(segment.start.y, segment.control1.y, segment.control2.y, segment.end.y, segmentProgress),
    };
}
function createMusicArcLengthTable(segments) {
    const sampleCount = segments.length * MUSIC_CURVE_SAMPLES_PER_SEGMENT;
    const samples = Array.from({ length: sampleCount + 1 }, (_, index) => ({
        ...getMusicBezierPosition(segments, index / sampleCount),
        length: 0,
    }));
    for (let index = 1; index < samples.length; index += 1) {
        const previous = samples[index - 1];
        const current = samples[index];
        current.length =
            previous.length +
                Math.hypot(current.x - previous.x, current.y - previous.y);
    }
    return {
        samples,
        totalLength: samples[samples.length - 1].length,
    };
}
function getMusicArcLengthPosition(table, progress) {
    const targetLength = (0, math_1.clamp)(progress, 0, 1) * table.totalLength;
    let lowerIndex = 0;
    let upperIndex = table.samples.length - 1;
    while (lowerIndex + 1 < upperIndex) {
        const middleIndex = Math.floor((lowerIndex + upperIndex) / 2);
        if (table.samples[middleIndex].length < targetLength) {
            lowerIndex = middleIndex;
        }
        else {
            upperIndex = middleIndex;
        }
    }
    const lowerSample = table.samples[lowerIndex];
    const upperSample = table.samples[upperIndex];
    const sampleLength = upperSample.length - lowerSample.length;
    const sampleProgress = sampleLength > 0
        ? (targetLength - lowerSample.length) / sampleLength
        : 0;
    return {
        x: (0, math_1.lerp)(lowerSample.x, upperSample.x, sampleProgress),
        y: (0, math_1.lerp)(lowerSample.y, upperSample.y, sampleProgress),
    };
}
const MUSIC_WAVE_ARC_LENGTH_TABLE = createMusicArcLengthTable(createMusicBezierSegments(MUSIC_WAVE_ANCHORS));
const MUSIC_STEM_ARC_LENGTH_TABLE = createMusicArcLengthTable(createMusicBezierSegments(MUSIC_STEM_ANCHORS));
const MUSIC_FLAG_OUTER_ARC_LENGTH_TABLE = createMusicArcLengthTable(MUSIC_FLAG_OUTER_SEGMENTS);
const MUSIC_FLAG_INNER_ARC_LENGTH_TABLE = createMusicArcLengthTable(MUSIC_FLAG_INNER_SEGMENTS);
function createMusicSweptPoint(index, center, tangent, radius, noiseOffset, haloScale) {
    const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
    const tangentX = tangent.x / tangentLength;
    const tangentY = tangent.y / tangentLength;
    const normalX = -tangentY;
    const normalY = tangentX;
    const particleLayer = (0, math_1.seededNoise)(index, noiseOffset);
    const radialProgress = (0, math_1.seededNoise)(index, noiseOffset + 1);
    const particleRadius = particleLayer < 0.72
        ? Math.sqrt(radialProgress) * radius
        : particleLayer < 0.93
            ? radius * (0.78 + radialProgress * 0.38)
            : radius * (1.18 + radialProgress * haloScale);
    const radialAngle = (0, math_1.seededNoise)(index, noiseOffset + 2) * Math.PI * 2;
    const tangentJitter = ((0, math_1.seededNoise)(index, noiseOffset + 3) * 2 - 1) *
        radius *
        (particleLayer < 0.93 ? 0.12 : 0.46);
    return createMorphPoint(center.x +
        normalX * Math.cos(radialAngle) * particleRadius +
        tangentX * tangentJitter, center.y +
        normalY * Math.cos(radialAngle) * particleRadius +
        tangentY * tangentJitter, Math.sin(radialAngle) * particleRadius * 0.82);
}
function getMusicCurveTangent(table, progress) {
    const tangentOffset = 0.0015;
    const previous = getMusicArcLengthPosition(table, progress - tangentOffset);
    const next = getMusicArcLengthPosition(table, progress + tangentOffset);
    return { x: next.x - previous.x, y: next.y - previous.y };
}
function createMusicWavePoint(index, localIndex, componentPoints) {
    const progress = (localIndex + 0.5) / componentPoints;
    const center = getMusicArcLengthPosition(MUSIC_WAVE_ARC_LENGTH_TABLE, progress);
    const tangent = getMusicCurveTangent(MUSIC_WAVE_ARC_LENGTH_TABLE, progress);
    const amplitude = Math.abs(center.y);
    const envelope = Math.sin(progress * Math.PI) ** 0.55;
    const radius = 0.035 + amplitude * 0.2 + envelope * 0.014;
    return createMusicSweptPoint(index, center, tangent, radius, 81, 0.92);
}
function createMusicHeadPoint(index) {
    const particleLayer = (0, math_1.seededNoise)(index, 121);
    const angle = (0, math_1.seededNoise)(index, 122) * Math.PI * 2;
    const radialProgress = (0, math_1.seededNoise)(index, 124);
    const radialScale = particleLayer < 0.78
        ? Math.sqrt(radialProgress) * 0.94
        : particleLayer < 0.98
            ? 0.94 + radialProgress * 0.08
            : 1.04 + radialProgress * 0.12;
    const dropProfile = Math.sin(angle / 2) ** 0.58;
    const boundaryX = Math.cos(angle) * 0.44;
    const boundaryY = Math.sin(angle) * dropProfile * 0.35;
    const localX = boundaryX * radialScale;
    const localY = boundaryY * radialScale;
    const tilt = -0.3;
    const interiorDepth = Math.sqrt(Math.max(0, 1 - Math.min(1, radialScale) ** 2));
    const depthScale = particleLayer < 0.78 ? interiorDepth : 0.28;
    return createMorphPoint(-0.18 + localX * Math.cos(tilt) - localY * Math.sin(tilt), 0.58 + localX * Math.sin(tilt) + localY * Math.cos(tilt), ((0, math_1.seededNoise)(index, 125) * 2 - 1) *
        0.08 *
        (0.35 + depthScale * 0.65));
}
function createMusicStemPoint(index, localIndex, componentPoints) {
    const progress = (localIndex + 0.5) / componentPoints;
    const center = getMusicArcLengthPosition(MUSIC_STEM_ARC_LENGTH_TABLE, progress);
    const tangent = getMusicCurveTangent(MUSIC_STEM_ARC_LENGTH_TABLE, progress);
    return createMusicSweptPoint(index, center, tangent, (0, math_1.lerp)(0.09, 0.055, progress), 141, 0.48);
}
function createMusicFlagPoint(index, localIndex, componentPoints) {
    const capPoints = Math.max(1, Math.floor(componentPoints * 0.06));
    const bodyPoints = Math.max(1, componentPoints - capPoints);
    if (localIndex >= bodyPoints) {
        const capIndex = localIndex - bodyPoints;
        const angle = ((capIndex + 0.5) / capPoints) * Math.PI * 2;
        const outerEnd = MUSIC_FLAG_OUTER_SEGMENTS.at(-1)?.end ?? {
            x: 0.69,
            y: -0.13,
        };
        const innerEnd = MUSIC_FLAG_INNER_SEGMENTS.at(-1)?.end ?? {
            x: 0.65,
            y: -0.11,
        };
        const center = {
            x: (outerEnd.x + innerEnd.x) / 2,
            y: (outerEnd.y + innerEnd.y) / 2,
        };
        const across = {
            x: (outerEnd.x - innerEnd.x) / 2,
            y: (outerEnd.y - innerEnd.y) / 2,
        };
        const acrossLength = Math.hypot(across.x, across.y) || 1;
        const tangent = { x: -across.y, y: across.x };
        const capLayer = (0, math_1.seededNoise)(index, 171);
        const capRadius = capLayer < 0.7
            ? Math.sqrt((0, math_1.seededNoise)(index, 172)) * 0.9
            : 0.9 + (0, math_1.seededNoise)(index, 172) * 0.12;
        return createMorphPoint(center.x +
            across.x * Math.cos(angle) * capRadius +
            (tangent.x / acrossLength) *
                Math.sin(angle) *
                acrossLength *
                0.72 *
                capRadius, center.y +
            across.y * Math.cos(angle) * capRadius +
            (tangent.y / acrossLength) *
                Math.sin(angle) *
                acrossLength *
                0.72 *
                capRadius, ((0, math_1.seededNoise)(index, 173) * 2 - 1) * 0.008);
    }
    const progress = (localIndex + 0.5) / bodyPoints;
    const outerPosition = getMusicArcLengthPosition(MUSIC_FLAG_OUTER_ARC_LENGTH_TABLE, progress);
    const innerPosition = getMusicArcLengthPosition(MUSIC_FLAG_INNER_ARC_LENGTH_TABLE, progress);
    const outerTangent = getMusicCurveTangent(MUSIC_FLAG_OUTER_ARC_LENGTH_TABLE, progress);
    const innerTangent = getMusicCurveTangent(MUSIC_FLAG_INNER_ARC_LENGTH_TABLE, progress);
    const tangent = {
        x: outerTangent.x + innerTangent.x,
        y: outerTangent.y + innerTangent.y,
    };
    const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
    const tangentX = tangent.x / tangentLength;
    const tangentY = tangent.y / tangentLength;
    const ribbonWidth = Math.hypot(innerPosition.x - outerPosition.x, innerPosition.y - outerPosition.y);
    const particleLayer = (0, math_1.seededNoise)(index, 161);
    const useOuterEdge = (0, math_1.seededNoise)(index, 162) < 0.5;
    const crossProgress = (0, math_1.seededNoise)(index, 163);
    const ribbonProgress = particleLayer < 0.68
        ? (0, math_1.lerp)(0.1, 0.9, crossProgress)
        : particleLayer < 0.98
            ? useOuterEdge
                ? (0, math_1.lerp)(-0.015, 0.025, crossProgress)
                : (0, math_1.lerp)(0.975, 1.015, crossProgress)
            : useOuterEdge
                ? (0, math_1.lerp)(-0.05, -0.12, crossProgress)
                : (0, math_1.lerp)(1.05, 1.12, crossProgress);
    const tangentJitter = ((0, math_1.seededNoise)(index, 164) * 2 - 1) *
        ribbonWidth *
        (particleLayer < 0.98 ? 0.02 : 0.06);
    return createMorphPoint((0, math_1.lerp)(outerPosition.x, innerPosition.x, ribbonProgress) +
        tangentX * tangentJitter, (0, math_1.lerp)(outerPosition.y, innerPosition.y, ribbonProgress) +
        tangentY * tangentJitter, ((0, math_1.seededNoise)(index, 165) * 2 - 1) *
        Math.min(ribbonWidth, 0.18) *
        (particleLayer < 0.98 ? 0.12 : 0.2));
}
function createMusicPoint(index, totalPoints) {
    const wavePoints = Math.max(1, Math.floor(totalPoints * 0.32));
    const headPoints = Math.max(1, Math.floor(totalPoints * 0.24));
    const stemPoints = Math.max(1, Math.floor(totalPoints * 0.16));
    const flagStart = wavePoints + headPoints + stemPoints;
    if (index < wavePoints) {
        return createMusicWavePoint(index, index, wavePoints);
    }
    if (index < wavePoints + headPoints) {
        return createMusicHeadPoint(index);
    }
    if (index < flagStart) {
        return createMusicStemPoint(index, index - wavePoints - headPoints, stemPoints);
    }
    return createMusicFlagPoint(index, index - flagStart, Math.max(1, totalPoints - flagStart));
}
function signedPower(value, exponent) {
    return Math.sign(value) * Math.pow(Math.abs(value), exponent);
}
function getImageMountainRidge(x) {
    const controlPoints = [
        { x: -0.9, y: 0.58 },
        { x: -0.5, y: 0.14 },
        { x: 0.02, y: 0.6 },
        { x: 0.5, y: 0.02 },
        { x: 0.9, y: 0.56 },
    ];
    for (let index = 0; index < controlPoints.length - 1; index += 1) {
        const start = controlPoints[index];
        const end = controlPoints[index + 1];
        if (x <= end.x) {
            const progress = (0, math_1.clamp)((x - start.x) / (end.x - start.x), 0, 1);
            const easedProgress = progress * progress * (3 - 2 * progress);
            return (0, math_1.lerp)(start.y, end.y, easedProgress);
        }
    }
    return controlPoints[controlPoints.length - 1].y;
}
function createImagePoint(index, totalPoints) {
    const progress = (index + 0.5) / totalPoints;
    let x;
    let y;
    let thickness;
    if (progress < 0.38) {
        const frameProgress = progress / 0.38;
        const angle = frameProgress * Math.PI * 2;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const normalOffset = ((0, math_1.seededNoise)(index, 51) * 2 - 1) * 0.035;
        x = signedPower(cosine, 0.48) * (1.02 + normalOffset);
        y = signedPower(sine, 0.48) * (0.9 + normalOffset * 0.82);
        thickness = 0.022;
    }
    else if (progress < 0.63) {
        const ridgeProgress = (progress - 0.38) / 0.25;
        x = (0, math_1.lerp)(-0.9, 0.9, ridgeProgress);
        y = getImageMountainRidge(x);
        thickness = 0.032;
    }
    else if (progress < 0.8) {
        x = (0, math_1.lerp)(-0.86, 0.86, (0, math_1.seededNoise)(index, 52));
        y = (0, math_1.lerp)(getImageMountainRidge(x) + 0.035, 0.73, Math.sqrt((0, math_1.seededNoise)(index, 53)));
        thickness = 0.045;
    }
    else if (progress < 0.95) {
        const sunProgress = (progress - 0.8) / 0.15;
        const angle = (0, math_1.seededNoise)(index, 54) * Math.PI * 2;
        const radius = sunProgress < 0.64
            ? 0.205 + ((0, math_1.seededNoise)(index, 55) * 2 - 1) * 0.025
            : Math.sqrt((0, math_1.seededNoise)(index, 56)) * 0.18;
        x = 0.48 + Math.cos(angle) * radius;
        y = -0.34 + Math.sin(angle) * radius;
        thickness = 0.018;
    }
    else {
        const angle = (0, math_1.seededNoise)(index, 57) * Math.PI * 2;
        const radius = 1.02 + (0, math_1.seededNoise)(index, 58) * 0.18;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius * 0.88;
        thickness = 0.055;
    }
    return createMorphPoint(x + ((0, math_1.seededNoise)(index, 59) * 2 - 1) * thickness, y + ((0, math_1.seededNoise)(index, 60) * 2 - 1) * thickness, ((0, math_1.seededNoise)(index, 61) * 2 - 1) * 0.1);
}
const VIDEO_BODY_CENTER_Y = 0.32;
const VIDEO_CLAPPER_ANGLE = -0.28;
const VIDEO_CLAPPER_CENTER = { x: -0.04, y: -0.71 };
const VIDEO_PLAY_TRIANGLE = [
    { x: -0.28, y: 0.05 },
    { x: -0.28, y: 0.69 },
    { x: 0.4, y: 0.37 },
];
function rotateVideoPoint(point, center, angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return {
        x: center.x + point.x * cosine - point.y * sine,
        y: center.y + point.x * sine + point.y * cosine,
    };
}
function getVideoSuperellipsePoint(progress, halfWidth, halfHeight, exponent = 0.3) {
    const angle = progress * Math.PI * 2;
    return {
        x: signedPower(Math.cos(angle), exponent) * halfWidth,
        y: signedPower(Math.sin(angle), exponent) * halfHeight,
    };
}
function getVideoRectanglePerimeterPoint(progress, halfWidth, halfHeight) {
    const horizontalLength = halfWidth * 2;
    const verticalLength = halfHeight * 2;
    const perimeter = (horizontalLength + verticalLength) * 2;
    let distance = (0, math_1.clamp)(progress, 0, 1) * perimeter;
    if (distance <= horizontalLength) {
        return { x: (0, math_1.lerp)(-halfWidth, halfWidth, distance / horizontalLength), y: -halfHeight };
    }
    distance -= horizontalLength;
    if (distance <= verticalLength) {
        return { x: halfWidth, y: (0, math_1.lerp)(-halfHeight, halfHeight, distance / verticalLength) };
    }
    distance -= verticalLength;
    if (distance <= horizontalLength) {
        return { x: (0, math_1.lerp)(halfWidth, -halfWidth, distance / horizontalLength), y: halfHeight };
    }
    distance -= horizontalLength;
    return { x: -halfWidth, y: (0, math_1.lerp)(halfHeight, -halfHeight, distance / verticalLength) };
}
function getVideoTrianglePerimeterPoint(progress) {
    const [start, middle, end] = VIDEO_PLAY_TRIANGLE;
    const edgeLengths = [
        Math.hypot(middle.x - start.x, middle.y - start.y),
        Math.hypot(end.x - middle.x, end.y - middle.y),
        Math.hypot(start.x - end.x, start.y - end.y),
    ];
    const perimeter = edgeLengths.reduce((sum, length) => sum + length, 0);
    let distance = (0, math_1.clamp)(progress, 0, 1) * perimeter;
    for (let edgeIndex = 0; edgeIndex < edgeLengths.length; edgeIndex += 1) {
        const edgeLength = edgeLengths[edgeIndex];
        if (distance <= edgeLength) {
            const edgeStart = VIDEO_PLAY_TRIANGLE[edgeIndex];
            const edgeEnd = VIDEO_PLAY_TRIANGLE[(edgeIndex + 1) % VIDEO_PLAY_TRIANGLE.length];
            const edgeProgress = distance / edgeLength;
            return {
                x: (0, math_1.lerp)(edgeStart.x, edgeEnd.x, edgeProgress),
                y: (0, math_1.lerp)(edgeStart.y, edgeEnd.y, edgeProgress),
            };
        }
        distance -= edgeLength;
    }
    return start;
}
function createVideoBodyFramePoint(index, localIndex, componentPoints) {
    const progress = (localIndex + 0.5) / componentPoints;
    const boundary = getVideoSuperellipsePoint(progress, 1, 0.6, 0.28);
    const normalOffset = ((0, math_1.seededNoise)(index, 201) * 2 - 1) * 0.025;
    return createMorphPoint(boundary.x * (1 + normalOffset), VIDEO_BODY_CENTER_Y + boundary.y * (1 + normalOffset), ((0, math_1.seededNoise)(index, 202) * 2 - 1) * 0.055);
}
function createVideoBodyInteriorPoint(index) {
    const y = (0, math_1.lerp)(-0.13, 0.82, (0, math_1.seededNoise)(index, 211));
    const cornerTaper = y > 0.68 ? ((y - 0.68) / 0.14) * 0.08 : 0;
    const halfWidth = 0.91 - cornerTaper;
    return createMorphPoint((0, math_1.lerp)(-halfWidth, halfWidth, (0, math_1.seededNoise)(index, 212)), y, ((0, math_1.seededNoise)(index, 213) * 2 - 1) * 0.04);
}
function createVideoBodyStripPoint(index, localIndex, componentPoints) {
    const outlinePoints = Math.floor(componentPoints * 0.35);
    if (localIndex < outlinePoints) {
        const point = getVideoRectanglePerimeterPoint((localIndex + 0.5) / Math.max(1, outlinePoints), 0.98, 0.1);
        return createMorphPoint(point.x + ((0, math_1.seededNoise)(index, 221) * 2 - 1) * 0.018, -0.19 + point.y + ((0, math_1.seededNoise)(index, 222) * 2 - 1) * 0.018, ((0, math_1.seededNoise)(index, 223) * 2 - 1) * 0.045);
    }
    const stripeIndex = (localIndex - outlinePoints) % 5;
    const stripeCenter = (0, math_1.lerp)(-0.78, 0.78, stripeIndex / 4);
    const y = (0, math_1.lerp)(-0.27, -0.11, (0, math_1.seededNoise)(index, 224));
    const x = (0, math_1.clamp)(stripeCenter +
        (y + 0.19) * 1.15 +
        ((0, math_1.seededNoise)(index, 225) * 2 - 1) * 0.09, -0.94, 0.94);
    return createMorphPoint(x, y, ((0, math_1.seededNoise)(index, 226) * 2 - 1) * 0.04);
}
function createVideoRaisedClapperPoint(index, localIndex, componentPoints) {
    const outlinePoints = Math.floor(componentPoints * 0.38);
    let localPoint;
    if (localIndex < outlinePoints) {
        const boundary = getVideoSuperellipsePoint((localIndex + 0.5) / Math.max(1, outlinePoints), 1.02, 0.14, 0.25);
        const offset = ((0, math_1.seededNoise)(index, 231) * 2 - 1) * 0.02;
        localPoint = {
            x: boundary.x * (1 + offset),
            y: boundary.y * (1 + offset),
        };
    }
    else {
        const stripeIndex = (localIndex - outlinePoints) % 5;
        const stripeCenter = (0, math_1.lerp)(-0.78, 0.78, stripeIndex / 4);
        const y = (0, math_1.lerp)(-0.105, 0.105, (0, math_1.seededNoise)(index, 232));
        localPoint = {
            x: (0, math_1.clamp)(stripeCenter +
                y * 1.35 +
                ((0, math_1.seededNoise)(index, 233) * 2 - 1) * 0.1, -0.96, 0.96),
            y,
        };
    }
    const point = rotateVideoPoint(localPoint, VIDEO_CLAPPER_CENTER, VIDEO_CLAPPER_ANGLE);
    return createMorphPoint(point.x, point.y, ((0, math_1.seededNoise)(index, 234) * 2 - 1) * 0.055);
}
function createVideoHingePoint(index, localIndex, componentPoints) {
    const progress = (localIndex + 0.5) / componentPoints;
    const angle = (0, math_1.seededNoise)(index, 241) * Math.PI * 2;
    const radius = progress < 0.65
        ? 0.16 + ((0, math_1.seededNoise)(index, 242) * 2 - 1) * 0.018
        : Math.sqrt((0, math_1.seededNoise)(index, 242)) * 0.145;
    return createMorphPoint(-0.98 + Math.cos(angle) * radius, -0.34 + Math.sin(angle) * radius, ((0, math_1.seededNoise)(index, 243) * 2 - 1) * 0.06);
}
function createVideoPlayPoint(index, localIndex, componentPoints) {
    const outlinePoints = Math.floor(componentPoints * 0.62);
    let point;
    if (localIndex < outlinePoints) {
        const boundary = getVideoTrianglePerimeterPoint((localIndex + 0.5) / Math.max(1, outlinePoints));
        const jitter = ((0, math_1.seededNoise)(index, 251) * 2 - 1) * 0.018;
        point = { x: boundary.x + jitter, y: boundary.y + jitter * 0.72 };
    }
    else {
        const [start, middle, end] = VIDEO_PLAY_TRIANGLE;
        const rootProgress = Math.sqrt((0, math_1.seededNoise)(index, 252));
        const edgeProgress = (0, math_1.seededNoise)(index, 253);
        point = {
            x: (1 - rootProgress) * start.x +
                rootProgress * (1 - edgeProgress) * middle.x +
                rootProgress * edgeProgress * end.x,
            y: (1 - rootProgress) * start.y +
                rootProgress * (1 - edgeProgress) * middle.y +
                rootProgress * edgeProgress * end.y,
        };
    }
    return createMorphPoint(point.x, point.y, ((0, math_1.seededNoise)(index, 254) * 2 - 1) * 0.055);
}
function createVideoHaloPoint(index, localIndex, componentPoints) {
    const bodyHaloPoints = Math.floor(componentPoints * 0.6);
    const scale = 1.06 + (0, math_1.seededNoise)(index, 261) * 0.1;
    let point;
    if (localIndex < bodyHaloPoints) {
        const boundary = getVideoSuperellipsePoint((localIndex + 0.5) / Math.max(1, bodyHaloPoints), 1, 0.6, 0.28);
        point = {
            x: boundary.x * scale,
            y: VIDEO_BODY_CENTER_Y + boundary.y * scale,
        };
    }
    else {
        const clapperHaloPoints = Math.max(1, componentPoints - bodyHaloPoints);
        const boundary = getVideoSuperellipsePoint((localIndex - bodyHaloPoints + 0.5) / clapperHaloPoints, 1.02 * scale, 0.14 * scale, 0.25);
        point = rotateVideoPoint(boundary, VIDEO_CLAPPER_CENTER, VIDEO_CLAPPER_ANGLE);
    }
    return createMorphPoint(point.x, point.y, ((0, math_1.seededNoise)(index, 262) * 2 - 1) * 0.1);
}
function createVideoPoint(index, totalPoints) {
    const bodyFramePoints = Math.floor(totalPoints * 0.22);
    const bodyInteriorPoints = Math.floor(totalPoints * 0.18);
    const bodyStripPoints = Math.floor(totalPoints * 0.14);
    const raisedClapperPoints = Math.floor(totalPoints * 0.2);
    const hingePoints = Math.floor(totalPoints * 0.06);
    const playPoints = Math.floor(totalPoints * 0.16);
    const bodyInteriorStart = bodyFramePoints;
    const bodyStripStart = bodyInteriorStart + bodyInteriorPoints;
    const raisedClapperStart = bodyStripStart + bodyStripPoints;
    const hingeStart = raisedClapperStart + raisedClapperPoints;
    const playStart = hingeStart + hingePoints;
    const haloStart = playStart + playPoints;
    if (index < bodyInteriorStart) {
        return createVideoBodyFramePoint(index, index, bodyFramePoints);
    }
    if (index < bodyStripStart) {
        return createVideoBodyInteriorPoint(index);
    }
    if (index < raisedClapperStart) {
        return createVideoBodyStripPoint(index, index - bodyStripStart, bodyStripPoints);
    }
    if (index < hingeStart) {
        return createVideoRaisedClapperPoint(index, index - raisedClapperStart, raisedClapperPoints);
    }
    if (index < playStart) {
        return createVideoHingePoint(index, index - hingeStart, hingePoints);
    }
    if (index < haloStart) {
        return createVideoPlayPoint(index, index - playStart, playPoints);
    }
    return createVideoHaloPoint(index, index - haloStart, Math.max(1, totalPoints - haloStart));
}
const CODE_BRACE_SEGMENTS = [
    {
        start: { x: -0.46, y: -1.08 },
        control1: { x: -0.68, y: -1.12 },
        control2: { x: -0.91, y: -1.02 },
        end: { x: -0.91, y: -0.78 },
    },
    {
        start: { x: -0.91, y: -0.78 },
        control1: { x: -0.88, y: -0.48 },
        control2: { x: -0.48, y: -0.28 },
        end: { x: -1.02, y: 0 },
    },
    {
        start: { x: -1.02, y: 0 },
        control1: { x: -0.48, y: 0.28 },
        control2: { x: -0.88, y: 0.48 },
        end: { x: -0.91, y: 0.78 },
    },
    {
        start: { x: -0.91, y: 0.78 },
        control1: { x: -0.91, y: 1.02 },
        control2: { x: -0.68, y: 1.12 },
        end: { x: -0.46, y: 1.08 },
    },
];
const CODE_BRACE_SAMPLES_PER_SEGMENT = 80;
function getCubicBezierCoordinate(start, control1, control2, end, progress) {
    const inverseProgress = 1 - progress;
    return (inverseProgress ** 3 * start +
        3 * inverseProgress ** 2 * progress * control1 +
        3 * inverseProgress * progress ** 2 * control2 +
        progress ** 3 * end);
}
function getCodeBraceCurvePosition(progress) {
    const scaledProgress = (0, math_1.clamp)(progress, 0, 1) * CODE_BRACE_SEGMENTS.length;
    const segmentIndex = Math.min(CODE_BRACE_SEGMENTS.length - 1, Math.floor(scaledProgress));
    const segmentProgress = scaledProgress - segmentIndex;
    const segment = CODE_BRACE_SEGMENTS[segmentIndex];
    return {
        x: getCubicBezierCoordinate(segment.start.x, segment.control1.x, segment.control2.x, segment.end.x, segmentProgress),
        y: getCubicBezierCoordinate(segment.start.y, segment.control1.y, segment.control2.y, segment.end.y, segmentProgress),
    };
}
function createCodeBraceArcLengthTable() {
    const sampleCount = CODE_BRACE_SEGMENTS.length * CODE_BRACE_SAMPLES_PER_SEGMENT;
    const samples = Array.from({ length: sampleCount + 1 }, (_, index) => {
        const position = getCodeBraceCurvePosition(index / sampleCount);
        return { ...position, length: 0 };
    });
    for (let index = 1; index < samples.length; index += 1) {
        const previous = samples[index - 1];
        const current = samples[index];
        current.length =
            previous.length +
                Math.hypot(current.x - previous.x, current.y - previous.y);
    }
    return {
        samples,
        totalLength: samples[samples.length - 1].length,
    };
}
const CODE_BRACE_ARC_LENGTH_TABLE = createCodeBraceArcLengthTable();
function getCodeBracePosition(progress) {
    const { samples, totalLength } = CODE_BRACE_ARC_LENGTH_TABLE;
    const targetLength = (0, math_1.clamp)(progress, 0, 1) * totalLength;
    let lowerIndex = 0;
    let upperIndex = samples.length - 1;
    while (lowerIndex + 1 < upperIndex) {
        const middleIndex = Math.floor((lowerIndex + upperIndex) / 2);
        if (samples[middleIndex].length < targetLength) {
            lowerIndex = middleIndex;
        }
        else {
            upperIndex = middleIndex;
        }
    }
    const lowerSample = samples[lowerIndex];
    const upperSample = samples[upperIndex];
    const sampleLength = upperSample.length - lowerSample.length;
    const sampleProgress = sampleLength > 0
        ? (targetLength - lowerSample.length) / sampleLength
        : 0;
    return {
        x: (0, math_1.lerp)(lowerSample.x, upperSample.x, sampleProgress),
        y: (0, math_1.lerp)(lowerSample.y, upperSample.y, sampleProgress),
    };
}
function createCodePoint(index, totalPoints) {
    const leftBracePoints = Math.ceil(totalPoints / 2);
    const isRightBrace = index >= leftBracePoints;
    const braceIndex = isRightBrace ? index - leftBracePoints : index;
    const bracePoints = isRightBrace ? totalPoints - leftBracePoints : leftBracePoints;
    const progress = (braceIndex + 0.5) / Math.max(1, bracePoints);
    const position = getCodeBracePosition(progress);
    const tangentOffset = 0.0015;
    const previousPosition = getCodeBracePosition(progress - tangentOffset);
    const nextPosition = getCodeBracePosition(progress + tangentOffset);
    let tangentX = nextPosition.x - previousPosition.x;
    const tangentY = nextPosition.y - previousPosition.y;
    if (isRightBrace) {
        position.x *= -1;
        tangentX *= -1;
    }
    const tangentLength = Math.hypot(tangentX, tangentY) || 1;
    const normalizedTangentX = tangentX / tangentLength;
    const normalizedTangentY = tangentY / tangentLength;
    const normalX = -normalizedTangentY;
    const normalY = normalizedTangentX;
    const longitudinalVolume = Math.sin(progress * Math.PI) ** 0.72;
    const waistTaper = Math.exp(-(((progress - 0.5) / 0.1) ** 2));
    const bodyRadius = 0.07 + longitudinalVolume * 0.1 - waistTaper * 0.045;
    const particleLayer = (0, math_1.seededNoise)(index, 71);
    const radialProgress = (0, math_1.seededNoise)(index, 72);
    const particleRadius = particleLayer < 0.8
        ? radialProgress ** 1.35 * bodyRadius
        : particleLayer < 0.96
            ? bodyRadius * (0.72 + radialProgress * 0.38)
            : bodyRadius * (1.12 + radialProgress * 0.48);
    const radialAngle = (0, math_1.seededNoise)(index, 73) * Math.PI * 2;
    const tangentJitter = ((0, math_1.seededNoise)(index, 74) * 2 - 1) *
        bodyRadius *
        (particleLayer < 0.96 ? 0.1 : 0.22);
    return createMorphPoint(position.x +
        normalX * Math.cos(radialAngle) * particleRadius +
        normalizedTangentX * tangentJitter, position.y +
        normalY * Math.cos(radialAngle) * particleRadius +
        normalizedTangentY * tangentJitter, Math.sin(radialAngle) * particleRadius * 0.82);
}
/**
 * Rest geometry of the "bloom" shape, shared with the audio reaction that
 * stretches it: a pulsing core, a corona of spectrum rays and expanding
 * shockwave rings. Units are shape-space, scaled by `sphereRadius`.
 */
exports.BLOOM_GEOMETRY = {
    coreRadius: 0.2,
    rayCount: 40,
    rayRoot: 0.3,
    rayRestLength: 0.22,
    waveInner: 0.34,
    waveSpan: 0.86,
    waveRestPhases: [0.36, 0.64, 0.92],
};
const BLOOM_CORE_SHARE = 0.18;
const BLOOM_RAY_SHARE = 0.48;
function createBloomCorePoint(index) {
    const vertical = (0, math_1.seededNoise)(index, 311) * 2 - 1;
    const azimuth = (0, math_1.seededNoise)(index, 312) * Math.PI * 2;
    const horizontal = Math.sqrt(Math.max(0, 1 - vertical * vertical));
    const depth = (0, math_1.seededNoise)(index, 313) < 0.6 ? 0.94 + (0, math_1.seededNoise)(index, 314) * 0.06 : Math.cbrt((0, math_1.seededNoise)(index, 314));
    const radius = exports.BLOOM_GEOMETRY.coreRadius * depth;
    return createMorphPoint(Math.cos(azimuth) * horizontal * radius, vertical * radius, Math.sin(azimuth) * horizontal * radius, "core");
}
// Rays are laid out around the core from the bottom, so the renderer can map
// each one to a spectrum band from its own angle.
function createBloomRayPoint(index, localIndex, componentPoints) {
    const { rayCount, rayRoot, rayRestLength } = exports.BLOOM_GEOMETRY;
    const perRay = Math.max(1, Math.floor(componentPoints / rayCount));
    const ray = localIndex % rayCount;
    const step = Math.floor(localIndex / rayCount);
    const along = (0, math_1.clamp)((step + (0, math_1.seededNoise)(index, 321)) / perRay, 0, 1);
    const angle = ((ray + 0.5) / rayCount) * Math.PI * 2 + ((0, math_1.seededNoise)(index, 322) * 2 - 1) * 0.012;
    const radius = rayRoot + along * rayRestLength;
    return createMorphPoint(Math.sin(angle) * radius, Math.cos(angle) * radius, ((0, math_1.seededNoise)(index, 323) * 2 - 1) * 0.02, "ray");
}
function createBloomWavePoint(index, localIndex) {
    const { waveInner, waveSpan, waveRestPhases } = exports.BLOOM_GEOMETRY;
    const phase = waveRestPhases[localIndex % waveRestPhases.length];
    const angle = (0, math_1.seededNoise)(index, 331) * Math.PI * 2;
    const radius = waveInner + phase * waveSpan + ((0, math_1.seededNoise)(index, 332) * 2 - 1) * 0.018;
    return createMorphPoint(Math.sin(angle) * radius, Math.cos(angle) * radius, ((0, math_1.seededNoise)(index, 333) * 2 - 1) * 0.03, "wave");
}
function createBloomPoint(index, totalPoints) {
    const coreCount = Math.max(1, Math.floor(totalPoints * BLOOM_CORE_SHARE));
    const rayCount = Math.max(1, Math.floor(totalPoints * BLOOM_RAY_SHARE));
    if (index < coreCount) {
        return createBloomCorePoint(index);
    }
    if (index < coreCount + rayCount) {
        return createBloomRayPoint(index, index - coreCount, rayCount);
    }
    return createBloomWavePoint(index, index - coreCount - rayCount);
}
function generateCustomShapePoints(shape, totalPoints) {
    const createPoint = shape === "bloom"
        ? createBloomPoint
        : shape === "music"
            ? createMusicPoint
            : shape === "image"
                ? createImagePoint
                : shape === "video"
                    ? createVideoPoint
                    : shape === "code"
                        ? createCodePoint
                        : null;
    if (!createPoint) {
        return null;
    }
    return Array.from({ length: totalPoints }, (_, index) => createPoint(index, totalPoints));
}
function generateShapePoints(shape, totalPoints) {
    const safeTotal = Math.max(1, Math.floor(totalPoints));
    const customPoints = generateCustomShapePoints(shape, safeTotal);
    if (customPoints) {
        return customPoints;
    }
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let index = 0; index < safeTotal; index += 1) {
        const y = safeTotal === 1 ? 0 : 1 - (index / (safeTotal - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const thetaRaw = phi * index;
        const direction = {
            x: Math.cos(thetaRaw) * radius,
            y,
            z: Math.sin(thetaRaw) * radius,
        };
        const projected = projectToShape(shape, direction.x, direction.y, direction.z);
        points.push(createMorphPoint(projected.x, projected.y, projected.z));
    }
    return points;
}
function getParticleCloudPoint(index, settings, timeValue) {
    const dirX = (0, math_1.seededNoise)(index, 1) * 2 - 1;
    const dirY = (0, math_1.seededNoise)(index, 2) * 2 - 1;
    const dirZ = (0, math_1.seededNoise)(index, 3) * 2 - 1;
    const length = Math.max(0.001, Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ));
    const baseScale = settings.spread * settings.objectScale;
    const radius = (0.35 + Math.cbrt((0, math_1.seededNoise)(index, 4)) * 0.65) * baseScale;
    const speed = 0.8 + (0, math_1.seededNoise)(index, 5) * 1.8;
    const phase = timeValue * speed + (0, math_1.seededNoise)(index, 6) * Math.PI * 2;
    const wobble = settings.chaos * 0.18;
    let x = (dirX / length) * radius;
    let y = (dirY / length) * radius;
    let z = (dirZ / length) * radius;
    if (settings.shape === "cube") {
        x = ((0, math_1.seededNoise)(index, 1) * 2 - 1) * baseScale;
        y = ((0, math_1.seededNoise)(index, 2) * 2 - 1) * baseScale;
        z = ((0, math_1.seededNoise)(index, 3) * 2 - 1) * baseScale;
    }
    else if (settings.shape === "pyramid") {
        const heightLevel = (0, math_1.seededNoise)(index, 2);
        const layerSize = 1 - heightLevel * 0.86;
        x = ((0, math_1.seededNoise)(index, 1) * 2 - 1) * baseScale * layerSize;
        y = (heightLevel * 2 - 1) * baseScale;
        z = ((0, math_1.seededNoise)(index, 3) * 2 - 1) * baseScale * layerSize;
    }
    else if (settings.shape === "ring") {
        const angle = (0, math_1.seededNoise)(index, 1) * Math.PI * 2;
        const ringRadius = baseScale * (0.65 + (0, math_1.seededNoise)(index, 4) * 0.35);
        x = Math.cos(angle) * ringRadius;
        y = ((0, math_1.seededNoise)(index, 2) * 2 - 1) * baseScale * 0.22;
        z = Math.sin(angle) * ringRadius;
    }
    if (settings.vortexStrength > 0) {
        const radial = Math.sqrt(x * x + z * z);
        const vortexPhase = timeValue * settings.vortexSpeed + (0, math_1.seededNoise)(index, 9) * Math.PI * 2 + y * 0.9;
        const vortexAngle = Math.atan2(z, x) + vortexPhase * settings.vortexStrength;
        x = Math.cos(vortexAngle) * radial;
        z = Math.sin(vortexAngle) * radial;
        y += Math.sin(vortexPhase) * baseScale * settings.vortexStrength * 0.08;
    }
    return {
        origX: x + Math.sin(phase) * wobble,
        origY: y + Math.cos(phase * 0.9) * wobble,
        origZ: z + Math.sin(phase * 1.15) * wobble,
        theta: (0, math_1.seededNoise)(index, 7) * Math.PI * 2 + Math.sin(phase) * settings.chaos,
        phiZ: (0, math_1.seededNoise)(index, 8) * Math.PI * 2 + Math.cos(phase) * settings.chaos,
    };
}
// A blended point keeps the part of the shape it is heading to, or of the one
// it leaves when the target has none, so an audio reaction fades by its
// amount instead of snapping when a shape swaps in or out.
function blendPoint(fromPoint, toPoint, amount) {
    return {
        part: toPoint.part ?? fromPoint.part,
        origX: (0, math_1.lerp)(fromPoint.origX, toPoint.origX, amount),
        origY: (0, math_1.lerp)(fromPoint.origY, toPoint.origY, amount),
        origZ: (0, math_1.lerp)(fromPoint.origZ, toPoint.origZ, amount),
        theta: (0, math_1.lerp)(fromPoint.theta, toPoint.theta, amount),
        phiZ: (0, math_1.lerp)(fromPoint.phiZ, toPoint.phiZ, amount),
    };
}

};
modules["morph/engine/timeline"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimelineDuration = getTimelineDuration;
exports.interpolateParams = interpolateParams;
exports.resolveTimelineFrame = resolveTimelineFrame;
const colors_1 = require("./colors");
const math_1 = require("./math");
function getTimelineDuration(states) {
    return states.reduce((total, state) => total + Math.max(0.01, state.duration), 0);
}
function interpolateParams(from, to, amount) {
    const t = (0, math_1.clamp)(amount, 0, 1);
    return {
        shape: t < 0.5 ? from.shape : to.shape,
        color1: (0, colors_1.lerpHexColor)(from.color1, to.color1, t),
        color2: (0, colors_1.lerpHexColor)(from.color2, to.color2, t),
        backgroundColor: (0, colors_1.lerpHexColor)(from.backgroundColor, to.backgroundColor, t),
        figureOpacity: (0, math_1.lerp)(from.figureOpacity, to.figureOpacity, t),
        points: Math.round((0, math_1.lerp)(from.points, to.points, t)),
        size: (0, math_1.lerp)(from.size, to.size, t),
        sphereRadius: (0, math_1.lerp)(from.sphereRadius, to.sphereRadius, t),
        trail: (0, math_1.lerp)(from.trail, to.trail, t),
        moveX: (0, math_1.lerp)(from.moveX, to.moveX, t),
        moveY: (0, math_1.lerp)(from.moveY, to.moveY, t),
        moveZ: (0, math_1.lerp)(from.moveZ, to.moveZ, t),
        speed: (0, math_1.lerp)(from.speed, to.speed, t),
        morph: (0, math_1.lerp)(from.morph, to.morph, t),
        rotX: (0, math_1.lerp)(from.rotX, to.rotX, t),
        rotY: (0, math_1.lerp)(from.rotY, to.rotY, t),
        pulseForce: (0, math_1.lerp)(from.pulseForce, to.pulseForce, t),
        pulseDecay: (0, math_1.lerp)(from.pulseDecay, to.pulseDecay, t),
        sizeImpact: (0, math_1.lerp)(from.sizeImpact, to.sizeImpact, t),
        speedImpact: (0, math_1.lerp)(from.speedImpact, to.speedImpact, t),
    };
}
function resolveTimelineFrame(baseParams, states, elapsedSeconds, loop) {
    if (states.length < 2) {
        return {
            params: baseParams,
            fromState: null,
            toState: null,
            progress: 0,
        };
    }
    const totalDuration = getTimelineDuration(states);
    const rawTime = loop
        ? ((elapsedSeconds % totalDuration) + totalDuration) % totalDuration
        : (0, math_1.clamp)(elapsedSeconds, 0, totalDuration);
    let cursor = 0;
    for (let index = 0; index < states.length; index += 1) {
        const fromState = states[index];
        const toState = states[(index + 1) % states.length];
        const duration = Math.max(0.01, fromState.duration);
        if (rawTime <= cursor + duration || index === states.length - 1) {
            const progress = (0, math_1.applyTransitionEasing)((rawTime - cursor) / duration, fromState.transitionEase);
            return {
                params: interpolateParams(fromState.data, toState.data, progress),
                fromState,
                toState,
                progress,
            };
        }
        cursor += duration;
    }
    return {
        params: states[states.length - 1].data,
        fromState: states[states.length - 1],
        toState: states[0],
        progress: 1,
    };
}

};
modules["morph/constants/chatMorphPreset"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAT_MORPH_MODES = exports.CHAT_MORPH_MENU_OPEN_PRESET = exports.CHAT_MORPH_VIDEO_PRESET = exports.CHAT_MORPH_CODE_PRESET = exports.CHAT_MORPH_IMAGE_PRESET = exports.CHAT_MORPH_MUSIC_PRESET = exports.CHAT_MORPH_WORKING_PRESET = exports.CHAT_MORPH_STANDBY_PRESET = void 0;
const defaults_1 = require("@/features/morph/engine/defaults");
const CHAT_MORPH_STANDBY_PARAMS = {
    ...defaults_1.DEFAULT_MORPH_PARAMS,
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
const CHAT_MORPH_WORKING_PARAMS = {
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
const CHAT_MORPH_MENU_OPEN_PARAMS = {
    ...CHAT_MORPH_STANDBY_PARAMS,
    points: 700,
    size: 0.88,
    sphereRadius: 0.38,
    speed: 0.028,
    morph: 0.32,
    color1: "#00ffc8",
    color2: "#16949b",
};
const CHAT_MORPH_MUSIC_PARAMS = {
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
const CHAT_MORPH_IMAGE_PARAMS = {
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
const CHAT_MORPH_CODE_PARAMS = {
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
const CHAT_MORPH_VIDEO_PARAMS = {
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
const CHAT_MORPH_PLAYING_PARAMS = {
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
function createChatTimelineState(id, name, data, duration = 5 / 3) {
    return (0, defaults_1.createTimelineState)(id, name, data, duration);
}
exports.CHAT_MORPH_STANDBY_PRESET = {
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
exports.CHAT_MORPH_WORKING_PRESET = {
    version: "morph-preset-v1",
    name: "Chat morph working",
    params: CHAT_MORPH_WORKING_PARAMS,
    timeline: [
        createChatTimelineState("working-cube", "Working cube", {
            ...CHAT_MORPH_WORKING_PARAMS,
            shape: "cube",
        }, 1.4),
        createChatTimelineState("working-sphere", "Working sphere", {
            ...CHAT_MORPH_WORKING_PARAMS,
            shape: "sphere",
        }, 1.4),
        createChatTimelineState("working-pyramid", "Working pyramid", {
            ...CHAT_MORPH_WORKING_PARAMS,
            shape: "pyramid",
        }, 1.4),
    ],
    duration: 4.2,
    loop: true,
};
function createChatShapePreset(name, stateId, params) {
    return {
        version: "morph-preset-v1",
        name,
        params,
        timeline: [createChatTimelineState(stateId, name, params)],
        duration: 5,
        loop: true,
    };
}
exports.CHAT_MORPH_MUSIC_PRESET = createChatShapePreset("Chat morph music", "music-note-wave", CHAT_MORPH_MUSIC_PARAMS);
exports.CHAT_MORPH_IMAGE_PRESET = createChatShapePreset("Chat morph image", "image-organic-frame", CHAT_MORPH_IMAGE_PARAMS);
exports.CHAT_MORPH_CODE_PRESET = createChatShapePreset("Chat morph code", "code-braces", CHAT_MORPH_CODE_PARAMS);
exports.CHAT_MORPH_VIDEO_PRESET = createChatShapePreset("Chat morph video", "video-clapperboard", CHAT_MORPH_VIDEO_PARAMS);
const CHAT_MORPH_PLAYING_PRESET = createChatShapePreset("Chat morph playing", "playing-sonic-bloom", CHAT_MORPH_PLAYING_PARAMS);
exports.CHAT_MORPH_MENU_OPEN_PRESET = {
    version: "morph-preset-v1",
    name: "Chat morph menu open",
    params: CHAT_MORPH_MENU_OPEN_PARAMS,
    timeline: [
        createChatTimelineState("menu-open-green-start", "Menu open green", CHAT_MORPH_MENU_OPEN_PARAMS),
        createChatTimelineState("menu-open-aqua", "Menu open aqua", {
            ...CHAT_MORPH_MENU_OPEN_PARAMS,
            color1: "#73ffe0",
            color2: "#176c77",
            speed: 0.032,
        }),
        createChatTimelineState("menu-open-green-end", "Menu open green", CHAT_MORPH_MENU_OPEN_PARAMS),
    ],
    duration: 4.2,
    loop: true,
};
exports.CHAT_MORPH_MODES = {
    standby: exports.CHAT_MORPH_STANDBY_PRESET,
    working: exports.CHAT_MORPH_WORKING_PRESET,
    music: exports.CHAT_MORPH_MUSIC_PRESET,
    image: exports.CHAT_MORPH_IMAGE_PRESET,
    code: exports.CHAT_MORPH_CODE_PRESET,
    video: exports.CHAT_MORPH_VIDEO_PRESET,
    menuOpen: exports.CHAT_MORPH_MENU_OPEN_PRESET,
    playing: CHAT_MORPH_PLAYING_PRESET,
};

};
modules["morph/types/morph"]=function(require,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MORPH_MODES = void 0;
exports.MORPH_MODES = [
    "standby",
    "working",
    "music",
    "image",
    "code",
    "video",
    "menuOpen",
    "playing",
];

};
modules["chat/utils/imagePlaceholderSorting"]=function(require,exports){
"use strict";
// DOM-free model of the image generation placeholder animation. The renderer
// walks these steps and owns every duration, so the traversals stay testable
// without a browser.
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleOrder = shuffleOrder;
exports.applySortingStep = applySortingStep;
exports.sortingSteps = sortingSteps;
function shuffleOrder(count, random = Math.random) {
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
function applySortingStep(slots, step) {
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
function settleRemaining(settled, count, steps) {
    for (let index = 0; index < count; index += 1) {
        if (settled.has(index))
            continue;
        steps.push({ kind: "settled", index });
    }
}
function bubbleSteps(keys, steps) {
    const settled = new Set();
    for (let end = keys.length - 1; end > 0; end -= 1) {
        let changed = false;
        for (let index = 0; index < end; index += 1) {
            steps.push({ kind: "compare", left: index, right: index + 1 });
            if (keys[index] > keys[index + 1]) {
                const step = { kind: "swap", left: index, right: index + 1 };
                applySortingStep(keys, step);
                steps.push(step);
                changed = true;
            }
        }
        steps.push({ kind: "settled", index: end });
        settled.add(end);
        if (!changed)
            break;
    }
    settleRemaining(settled, keys.length, steps);
}
function mergeSteps(keys, steps) {
    const count = keys.length;
    for (let width = 1; width < count; width *= 2) {
        for (let left = 0; left < count; left += 2 * width) {
            const mid = Math.min(left + width, count);
            const right = Math.min(left + 2 * width, count);
            if (mid >= right)
                continue;
            steps.push({ kind: "range", left, right: right - 1 });
            const order = [];
            let lower = left;
            let upper = mid;
            while (lower < mid && upper < right) {
                steps.push({ kind: "compare", left: lower, right: upper });
                if (keys[lower] <= keys[upper])
                    order.push(lower++);
                else
                    order.push(upper++);
            }
            while (lower < mid)
                order.push(lower++);
            while (upper < right)
                order.push(upper++);
            const step = { kind: "reorder", left, order };
            applySortingStep(keys, step);
            steps.push(step);
        }
    }
    settleRemaining(new Set(), count, steps);
}
function quickSteps(keys, steps) {
    const settled = new Set();
    const sort = (low, high) => {
        if (low >= high)
            return;
        steps.push({ kind: "range", left: low, right: high });
        const pivotKey = keys[high];
        let boundary = low;
        for (let index = low; index < high; index += 1) {
            steps.push({ kind: "pivot", index, pivot: keys.indexOf(pivotKey) });
            if (keys[index] < pivotKey) {
                if (boundary !== index) {
                    const step = { kind: "swap", left: boundary, right: index };
                    applySortingStep(keys, step);
                    steps.push(step);
                }
                boundary += 1;
            }
        }
        const pivotSlot = keys.indexOf(pivotKey);
        if (boundary !== pivotSlot) {
            const step = { kind: "swap", left: boundary, right: pivotSlot };
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
function sortingSteps(algorithm, order) {
    const keys = [...order];
    const steps = [];
    if (algorithm === "bubble")
        bubbleSteps(keys, steps);
    else if (algorithm === "merge")
        mergeSteps(keys, steps);
    else
        quickSteps(keys, steps);
    return steps;
}

};
function load(id){if(cache[id])return cache[id];const exp=cache[id]={};if(!modules[id])throw Error('Missing native module '+id);modules[id](ref=>{let dest;if(ref.startsWith('@/features/'))dest=ref.slice(11);else{const parts=(id.slice(0,id.lastIndexOf('/')+1)+ref).split('/'),stack=[];for(const p of parts){if(p==='..')stack.pop();else if(p!=='.')stack.push(p)}dest=stack.join('/')}return load(dest)},exp);return exp;}
window.NativeMorph={...load('morph/engine/renderMorphFrame'),...load('morph/engine/orchestration'),...load('morph/engine/timeline'),...load('morph/engine/motion'),...load('morph/constants/chatMorphPreset')};window.NativeSorting=load('chat/utils/imagePlaceholderSorting');})();