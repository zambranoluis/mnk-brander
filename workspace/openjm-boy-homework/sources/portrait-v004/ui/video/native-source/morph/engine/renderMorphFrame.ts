import type {
  MorphHelixSettings,
  MorphParams,
  MorphPoint,
  MorphTimelineState,
} from "../types/morph";
import { reactPointToAudio, type MorphAudioReaction } from "./audioReaction";
import { hexToRgb, mixRgb, rgbString } from "./colors";
import { getMoveZScale, clamp, lerp, seededNoise } from "./math";
import { blendPoint, generateShapePoints, getParticleCloudPoint } from "./shapes";

export type MorphPointCache = Map<string, MorphPoint[]>;

export type MorphParticleSample = {
  point: MorphPoint;
  opacity: number;
  sizeScale: number;
  sourceIndex?: number;
  finalOpacity?: number;
};

export type MorphParticleSnapshot = {
  samples: MorphParticleSample[];
};

export type MorphParticleResolutionOptions = {
  params: MorphParams;
  time: number;
  pointCache: MorphPointCache;
  fromState?: MorphTimelineState | null;
  toState?: MorphTimelineState | null;
  transitionProgress?: number;
  sourceSnapshot?: MorphParticleSnapshot | null;
  targetSnapshot?: MorphParticleSnapshot | null;
};

export type MorphRenderFrameOptions = MorphParticleResolutionOptions & {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  pulse: number;
  rotationX?: number;
  rotationY?: number;
  pointDensityScale?: number;
  objectScale?: number;
  pointScale?: number;
  logicalWidth?: number;
  logicalHeight?: number;
  originX?: number;
  originY?: number;
  /** Absent, or at amount 0, the frame renders exactly as without audio. */
  audio?: MorphAudioReaction;
};

function getParticleCloudAmount(progress: number) {
  return 1 - Math.abs(clamp(progress, 0, 1) * 2 - 1);
}

function easeParticleTraversal(amount: number) {
  const t = clamp(amount, 0, 1);

  return t * t * (3 - 2 * t);
}

function getCachedShapePoints(
  cache: MorphPointCache,
  shape: MorphParams["shape"],
  points: number,
) {
  const safePoints = Math.max(1, Math.floor(points));
  const key = `${shape}-${safePoints}`;
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const next = generateShapePoints(shape, safePoints).sort((pointA, pointB) => {
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

function buildHelixBasis(settings: MorphHelixSettings) {
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

function getHelixPoint(
  index: number,
  sourceState: MorphTimelineState,
  timeValue: number,
  isDoubleHelix: boolean,
  traversalProgress: number,
): MorphPoint {
  const settings = sourceState.cloud;
  const helix = sourceState.helix;
  const baseScale = settings.spread * settings.objectScale;
  const basis = buildHelixBasis(helix);
  const directionSign = helix.direction === "reverse" ? -1 : 1;
  const drawDirectionSign = helix.drawDirection === "reverse" ? -1 : 1;
  const tunnelAmount = clamp(helix.tunnel, 0, 2);
  const screwSpinSpeed = 0.4 + settings.vortexSpeed * 0.35;
  const loopCount = clamp(helix.loops, 1, 12);
  const rungCount = Math.max(10, Math.round(loopCount * 3.4));
  const roleNoise = seededNoise(index, 17);
  const isBridgeAtom = isDoubleHelix && roleNoise < 0.34;
  const cloudDrive = helix.cloud ? Math.pow(clamp(helix.cloudIntensity / 2, 0, 1), 1.15) : 0;
  const rawHeightProgress = clamp(traversalProgress, 0, 1);
  const heightProgress = isBridgeAtom ? (Math.floor(rawHeightProgress * rungCount) + 0.5) / rungCount : rawHeightProgress;
  const drawHeightProgress = drawDirectionSign === -1 ? 1 - heightProgress : heightProgress;
  const axialOffset = (drawHeightProgress * 2 - 1) * baseScale * 1.45;
  const strandFlipped = isDoubleHelix && !isBridgeAtom && seededNoise(index, 19) < 0.5;
  const strandPhase = strandFlipped ? Math.PI : 0;
  const strandProgress = strandFlipped ? 1 - drawHeightProgress : drawHeightProgress;
  const helixPhase =
    directionSign * (strandProgress * Math.PI * 2 * loopCount + timeValue * screwSpinSpeed) + strandPhase;
  const helixRadius = baseScale * (isDoubleHelix ? 0.34 : 0.4) * (1 + tunnelAmount * 0.42);
  const radialX = Math.cos(helixPhase) * basis.u.x + Math.sin(helixPhase) * basis.v.x;
  const radialY = Math.cos(helixPhase) * basis.u.y + Math.sin(helixPhase) * basis.v.y;
  const radialZ = Math.cos(helixPhase) * basis.u.z + Math.sin(helixPhase) * basis.v.z;
  const tangentX = -Math.sin(helixPhase) * basis.u.x + Math.cos(helixPhase) * basis.v.x;
  const tangentY = -Math.sin(helixPhase) * basis.u.y + Math.cos(helixPhase) * basis.v.y;
  const tangentZ = -Math.sin(helixPhase) * basis.u.z + Math.cos(helixPhase) * basis.v.z;
  const cloudOrbitPhase =
    helixPhase * (0.82 + cloudDrive * 0.12) +
    timeValue * (0.75 + cloudDrive * 0.55) +
    (seededNoise(index, 24) - 0.5) * Math.PI * 2.25;
  const cloudOrbitRadius =
    helixRadius *
    (0.34 + cloudDrive * 0.62) *
    (0.9 + 0.18 * Math.sin(drawHeightProgress * Math.PI * 2.6 + seededNoise(index, 25) * Math.PI * 2));
  const cloudOrbitX = Math.cos(cloudOrbitPhase) * basis.u.x + Math.sin(cloudOrbitPhase) * basis.v.x;
  const cloudOrbitY = Math.cos(cloudOrbitPhase) * basis.u.y + Math.sin(cloudOrbitPhase) * basis.v.y;
  const cloudOrbitZ = Math.cos(cloudOrbitPhase) * basis.u.z + Math.sin(cloudOrbitPhase) * basis.v.z;
  const cloudAxisDrift = helix.cloud
    ? Math.sin(cloudOrbitPhase * 0.7 + seededNoise(index, 26) * Math.PI * 2) * baseScale * (0.12 + cloudDrive * 0.13)
    : 0;
  const bridgeSide = isBridgeAtom ? (seededNoise(index, 20) < 0.5 ? -1 : 1) : 1;
  const radialScale = isBridgeAtom ? bridgeSide * (0.22 + seededNoise(index, 31) * 0.08) : 1;
  const thickness = baseScale * (isBridgeAtom ? 0.01 : 0.018) * (1 + settings.chaos * 0.65) * clamp(helix.thickness, 0.2, 25);
  const radialJitter = (seededNoise(index, 21) * 2 - 1) * thickness;
  const tangentJitter = (seededNoise(index, 22) * 2 - 1) * thickness;
  const axialJitter = (seededNoise(index, 23) * 2 - 1) * thickness * 0.45;
  const bridgeTightness = isBridgeAtom ? 0.45 : 1;
  const cloudRadialJitter = helix.cloud
    ? (seededNoise(index, 30) * 2 - 1) * baseScale * (0.1 + cloudDrive * 0.12) * bridgeTightness
    : 0;
  const activeRadius = helix.cloud ? helixRadius * (0.92 + cloudDrive * 0.22) : helixRadius;
  const cloudRadius = activeRadius * radialScale + radialJitter + cloudRadialJitter + cloudOrbitRadius * (helix.cloud ? 0.58 + cloudDrive * 0.28 : 0);
  const x =
    basis.axis.x * (axialOffset + cloudAxisDrift * bridgeTightness) +
    radialX * cloudRadius +
    cloudOrbitX * cloudOrbitRadius +
    tangentX * tangentJitter +
    basis.axis.x * axialJitter;
  const y =
    basis.axis.y * (axialOffset + cloudAxisDrift * bridgeTightness) +
    radialY * cloudRadius +
    cloudOrbitY * cloudOrbitRadius +
    tangentY * tangentJitter +
    basis.axis.y * axialJitter;
  const z =
    basis.axis.z * (axialOffset + cloudAxisDrift * bridgeTightness) +
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
    phiZ: Math.acos(clamp(y / radius, -1, 1)),
  };
}

function resolvePointForTransition(
  index: number,
  fromPoint: MorphPoint,
  toPoint: MorphPoint,
  options: MorphParticleResolutionOptions,
) {
  const fromState = options.fromState;
  const progress = options.transitionProgress ?? 0;

  if (!fromState) {
    return fromPoint;
  }

  if (fromState.transitionEffect === "particle-cloud") {
    const cloudPoint = getParticleCloudPoint(index, fromState.cloud, options.time);
    const cloudPhase = progress < 0.5 ? progress * 2 : (progress - 0.5) * 2;

    return progress < 0.5
      ? blendPoint(fromPoint, cloudPoint, cloudPhase)
      : blendPoint(cloudPoint, toPoint, cloudPhase);
  }

  if (fromState.transitionEffect === "helix" || fromState.transitionEffect === "double-helix") {
    const traversalDelay = (index / Math.max(1, Math.max(fromState.data.points, options.params.points) - 1)) * 0.28;
    const traversalProgress = progress >= traversalDelay + 0.72 ? 1 : clamp((progress - traversalDelay) / 0.72, 0, 1);
    const entryBlend = easeParticleTraversal(clamp(traversalProgress / 0.16, 0, 1));
    const exitStart = 0.82 + traversalDelay * 0.28;
    const exitBlend = easeParticleTraversal(clamp((progress - exitStart) / Math.max(0.001, 1 - exitStart), 0, 1));
    const helixPoint = getHelixPoint(
      index,
      fromState,
      options.time,
      fromState.transitionEffect === "double-helix",
      traversalProgress,
    );

    return blendPoint(blendPoint(fromPoint, helixPoint, entryBlend), toPoint, exitBlend);
  }

  return blendPoint(fromPoint, toPoint, progress);
}

function resolveDensityTransition(
  index: number,
  fromPoints: MorphPoint[],
  toPoints: MorphPoint[],
  options: MorphParticleResolutionOptions,
) {
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
    const sourceIndex = Math.min(
      sourcePointCount - 1,
      Math.floor((index * sourcePointCount) / targetPointCount),
    );
    const sourceAnchor = fromPoints[sourceIndex];

    return {
      point: resolvePointForTransition(index, sourceAnchor, toPoint, options),
      opacity: progress,
      sizeScale: 1,
    };
  }

  if (sourcePointCount > targetPointCount) {
    const targetIndex = Math.min(
      targetPointCount - 1,
      Math.floor((index * targetPointCount) / sourcePointCount),
    );
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

function resolveSnapshotDensityTransition(
  index: number,
  sourceSnapshot: MorphParticleSnapshot,
  toPoints: MorphPoint[],
  targetPointCount: number,
  progress: number,
): MorphParticleSample {
  const sourcePointCount = sourceSnapshot.samples.length;
  const sourceSample = sourceSnapshot.samples[index];
  const toPoint = toPoints[index];

  if (index < Math.min(sourcePointCount, targetPointCount)) {
    return {
      point: blendPoint(sourceSample.point, toPoint, progress),
      opacity: lerp(sourceSample.opacity, 1, progress),
      sizeScale: lerp(sourceSample.sizeScale, 1, progress),
    };
  }

  if (targetPointCount > sourcePointCount) {
    const sourceIndex = Math.min(
      sourcePointCount - 1,
      Math.floor((index * sourcePointCount) / targetPointCount),
    );
    const sourceAnchor = sourceSnapshot.samples[sourceIndex];

    return {
      point: blendPoint(sourceAnchor.point, toPoint, progress),
      opacity: progress,
      sizeScale: lerp(sourceAnchor.sizeScale, 1, progress),
    };
  }

  const targetIndex = Math.min(
    targetPointCount - 1,
    Math.floor((index * targetPointCount) / sourcePointCount),
  );

  return {
    point: blendPoint(sourceSample.point, toPoints[targetIndex], progress),
    opacity: sourceSample.opacity * (1 - progress),
    sizeScale: sourceSample.sizeScale,
  };
}

function distanceSquared(pointA: MorphPoint, pointB: MorphPoint) {
  const deltaX = pointA.origX - pointB.origX;
  const deltaY = pointA.origY - pointB.origY;
  const deltaZ = pointA.origZ - pointB.origZ;

  return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
}

function findClosestSampleIndex(
  point: MorphPoint,
  samples: MorphParticleSample[],
  available?: boolean[],
) {
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

export function createMorphBridgeTargetSnapshot({
  sourceSnapshot,
  ...targetOptions
}: MorphParticleResolutionOptions & { sourceSnapshot: MorphParticleSnapshot }) {
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
      const targetIndex = findClosestSampleIndex(
        sourceSample.point,
        targetSamples,
        availableTargets,
      );
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
    const sourceIndex = findClosestSampleIndex(
      targetSample.point,
      sourceSamples,
      availableSources,
    );
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

    const targetIndex = findClosestSampleIndex(
      sourceSamples[sourceIndex].point,
      targetSamples,
    );
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

function easeMorphBridgeLocal(amount: number) {
  const t = clamp(amount, 0, 1);

  return t * t * (3 - 2 * t);
}

function getMorphBridgeRadialDirection(point: MorphPoint, index: number) {
  const length = Math.sqrt(
    point.origX * point.origX + point.origY * point.origY + point.origZ * point.origZ,
  );

  if (length > 0.0001) {
    return { x: point.origX / length, y: point.origY / length, z: point.origZ / length };
  }

  // Points that land exactly on the origin have no direction to bulge along -
  // give them a stable, index-seeded one instead of leaving them frozen at
  // the core while everything else puffs outward around them.
  const theta = seededNoise(index, 401) * Math.PI * 2;
  const phi = seededNoise(index, 402) * Math.PI;

  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

function getMorphEntropyOffset(index: number, time: number, salt: number) {
  const swirl =
    time * (0.6 + seededNoise(index, salt) * 1.6) +
    seededNoise(index, salt + 1) * Math.PI * 2;
  const elevation = (seededNoise(index, salt + 2) * 2 - 1) * (Math.PI / 2);
  const reach = 0.18 + seededNoise(index, salt + 3) * 0.35;

  return {
    x: Math.cos(swirl) * Math.cos(elevation) * reach,
    y: Math.sin(elevation) * reach,
    z: Math.sin(swirl) * Math.cos(elevation) * reach,
  };
}

function resolveBridgeSnapshotTransition(
  index: number,
  sourceSnapshot: MorphParticleSnapshot,
  targetSnapshot: MorphParticleSnapshot,
  progress: number,
  time: number,
): MorphParticleSample {
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
  const delay = seededNoise(index, 401) * MORPH_BRIDGE_STAGGER_SPAN;
  const localProgress = easeMorphBridgeLocal(
    (progress - delay) / Math.max(0.0001, 1 - delay),
  );

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
      opacity: lerp(initialOpacity, finalOpacity, localProgress),
      sizeScale: lerp(sourceSample.sizeScale, targetSample.sizeScale, localProgress),
    };
  }

  const bulgeEnvelope = Math.sin(localProgress * Math.PI);
  const basePoint = blendPoint(sourceSample.point, targetSample.point, localProgress);
  const travel = Math.hypot(
    targetSample.point.origX - sourceSample.point.origX,
    targetSample.point.origY - sourceSample.point.origY,
    targetSample.point.origZ - sourceSample.point.origZ,
  );
  const direction = getMorphBridgeRadialDirection(basePoint, index);
  const bulgeAmount = bulgeEnvelope * (MORPH_BRIDGE_BULGE_STRENGTH + travel * 0.18);

  return {
    point: {
      ...basePoint,
      origX: basePoint.origX + direction.x * bulgeAmount,
      origY: basePoint.origY + direction.y * bulgeAmount,
      origZ: basePoint.origZ + direction.z * bulgeAmount,
    },
    opacity: lerp(initialOpacity, finalOpacity, localProgress),
    sizeScale: lerp(sourceSample.sizeScale, targetSample.sizeScale, localProgress),
  };
}

function resolveMorphParticleSamples(
  options: MorphParticleResolutionOptions,
): MorphParticleSample[] {
  const {
    params,
    time,
    pointCache,
    fromState,
    toState,
    transitionProgress = 0,
    sourceSnapshot,
    targetSnapshot,
  } = options;
  const transitionEffect = fromState?.transitionEffect ?? "direct";
  if (sourceSnapshot && targetSnapshot) {
    return targetSnapshot.samples.map((_, index) =>
      resolveBridgeSnapshotTransition(
        index,
        sourceSnapshot,
        targetSnapshot,
        transitionProgress,
        time,
      ),
    );
  }
  const usesCloud =
    !sourceSnapshot &&
    !!fromState &&
    (transitionEffect === "particle-cloud" ||
      transitionEffect === "helix" ||
      transitionEffect === "double-helix");
  const sourcePointCount = Math.max(
    1,
    sourceSnapshot?.samples.length ??
      Math.floor(fromState?.data.points ?? params.points),
  );
  const targetPointCount = Math.max(
    1,
    Math.floor(toState?.data.points ?? params.points),
  );
  const maxPoints = usesCloud
    ? Math.max(fromState.data.points, toState?.data.points ?? params.points) *
      fromState.cloud.pointAmount
    : fromState || sourceSnapshot
      ? Math.max(sourcePointCount, targetPointCount)
      : params.points;
  const activeMaxPoints = Math.max(1, Math.floor(maxPoints));
  const fromPoints = sourceSnapshot
    ? []
    : getCachedShapePoints(
        pointCache,
        fromState?.data.shape ?? params.shape,
        usesCloud ? activeMaxPoints : sourcePointCount,
      );
  const toPoints = getCachedShapePoints(
    pointCache,
    toState?.data.shape ?? params.shape,
    usesCloud ? activeMaxPoints : targetPointCount,
  );
  const basePoints = getCachedShapePoints(pointCache, params.shape, activeMaxPoints);

  return Array.from({ length: activeMaxPoints }, (_, index) => {
    if (sourceSnapshot) {
      return resolveSnapshotDensityTransition(
        index,
        sourceSnapshot,
        toPoints,
        targetPointCount,
        transitionProgress,
      );
    }

    if (fromState) {
      return resolveDensityTransition(index, fromPoints, toPoints, options);
    }

    return { point: basePoints[index], opacity: 1, sizeScale: 1 };
  });
}

export function createMorphParticleSnapshot(
  options: MorphParticleResolutionOptions,
): MorphParticleSnapshot {
  return { samples: resolveMorphParticleSamples(options) };
}

export function renderMorphFrame(options: MorphRenderFrameOptions) {
  const {
    context,
    width,
    height,
    params,
    time,
    pulse,
    fromState,
    transitionProgress = 0,
    pointDensityScale = 1,
    objectScale = 1,
    pointScale = 1,
    logicalWidth = width,
    logicalHeight = height,
    originX = width / 2,
    originY = height / 2,
    audio,
  } = options;
  const reactsToAudio = !!audio && audio.amount > 0;
  const transitionEffect = fromState?.transitionEffect ?? "direct";
  const usesCloud =
    !options.sourceSnapshot &&
    !!fromState &&
    (transitionEffect === "particle-cloud" || transitionEffect === "helix" || transitionEffect === "double-helix");
  const particleSamples = resolveMorphParticleSamples(options);
  const activeMaxPoints = particleSamples.length;
  const visibleMaxPoints = Math.max(1, Math.floor(activeMaxPoints * pointDensityScale));
  const sphereSize =
    Math.min(logicalWidth, logicalHeight) * params.sphereRadius * objectScale;
  const offsetX = params.moveX * sphereSize;
  const offsetY = params.moveY * sphereSize;
  const moveZScale = getMoveZScale(params.moveZ);
  const rgbTop = hexToRgb(params.color1);
  const rgbBottom = hexToRgb(params.color2);
  const currentSize = (params.size + pulse * params.sizeImpact) * pointScale;
  const lockHelixOrbit =
    !!fromState &&
    (transitionEffect === "helix" || transitionEffect === "double-helix") &&
    !fromState.helix.autoOrbit;
  const renderRotX = lockHelixOrbit ? 0 : (options.rotationX ?? time * params.rotX);
  const renderRotY = lockHelixOrbit ? 0 : (options.rotationY ?? time * params.rotY);
  const cloudAmount = usesCloud ? getParticleCloudAmount(transitionProgress) : 0;
  const helixOrderAmount = transitionEffect === "helix" || transitionEffect === "double-helix" ? cloudAmount : 0;

  for (let visibleIndex = 0; visibleIndex < visibleMaxPoints; visibleIndex += 1) {
    const index =
      visibleMaxPoints === activeMaxPoints
        ? visibleIndex
        : Math.floor((visibleIndex / Math.max(1, visibleMaxPoints - 1)) * (activeMaxPoints - 1));
    const densityTransition = particleSamples[index];
    const sourcePoint = densityTransition.point;

    if (densityTransition.opacity <= 0) {
      continue;
    }
    const morph =
      Math.sin(sourcePoint.theta * 4 + time * 2) *
      Math.cos(sourcePoint.phiZ * 3 - time) *
      params.morph *
      (1 - helixOrderAmount);
    const audioPoint = reactsToAudio ? reactPointToAudio(sourcePoint, audio, pulse) : null;
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
    const gradientFactor = clamp((sourcePoint.origY * -1 + 1) / 2, 0, 1);
    const color = mixRgb(rgbTop, rgbBottom, gradientFactor);
    const baseDrawSize =
      cloudAmount > 0 && fromState
        ? lerp(currentSize, currentSize * fromState.cloud.pointSize, cloudAmount)
        : currentSize;
    const drawSize = baseDrawSize * (audioPoint?.sizeScale ?? 1);
    const opacity = params.figureOpacity * densityTransition.opacity * (audioPoint?.opacityScale ?? 1);

    if (opacity <= 0.005) {
      continue;
    }

    context.fillStyle = `rgba(${rgbString(color)}, ${opacity})`;
    context.beginPath();
    context.arc(
      px,
      py,
      Math.max(0.5, scale * drawSize * densityTransition.sizeScale),
      0,
      Math.PI * 2,
    );
    context.fill();
  }
}
