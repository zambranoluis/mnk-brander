import type { MorphCloudSettings, MorphPoint, MorphPointPart, MorphShape } from "../types/morph";
import { clamp, lerp, seededNoise } from "./math";

function projectToShape(shape: MorphShape, dx: number, dy: number, dz: number) {
  let t = 1;

  if (shape === "cube") {
    t = 1 / Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
  } else if (shape === "pyramid") {
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

function createMorphPoint(x: number, y: number, z: number, part?: MorphPointPart): MorphPoint {
  const distance = Math.sqrt(x * x + y * y + z * z) || 1;

  return {
    origX: x,
    origY: y,
    origZ: z,
    theta: Math.atan2(z, x),
    phiZ: Math.acos(clamp(y / distance, -1, 1)),
    part,
  };
}

type MusicPoint2D = Readonly<{ x: number; y: number }>;

type MusicBezierSegment = Readonly<{
  start: MusicPoint2D;
  control1: MusicPoint2D;
  control2: MusicPoint2D;
  end: MusicPoint2D;
}>;

type MusicArcLengthSample = MusicPoint2D & { length: number };

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
] as const;

const MUSIC_STEM_ANCHORS = [
  { x: 0.12, y: 0.48 },
  { x: 0.08, y: 0.08 },
  { x: 0.1, y: -0.46 },
  { x: 0.05, y: -0.88 },
] as const;

const MUSIC_FLAG_OUTER_SEGMENTS: readonly MusicBezierSegment[] = [
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

const MUSIC_FLAG_INNER_SEGMENTS: readonly MusicBezierSegment[] = [
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

function createMusicBezierSegments(
  anchors: readonly MusicPoint2D[],
): MusicBezierSegment[] {
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

function getMusicBezierPosition(
  segments: readonly MusicBezierSegment[],
  progress: number,
) {
  const scaledProgress = clamp(progress, 0, 1) * segments.length;
  const segmentIndex = Math.min(
    segments.length - 1,
    Math.floor(scaledProgress),
  );
  const segmentProgress = scaledProgress - segmentIndex;
  const segment = segments[segmentIndex];

  return {
    x: getCubicBezierCoordinate(
      segment.start.x,
      segment.control1.x,
      segment.control2.x,
      segment.end.x,
      segmentProgress,
    ),
    y: getCubicBezierCoordinate(
      segment.start.y,
      segment.control1.y,
      segment.control2.y,
      segment.end.y,
      segmentProgress,
    ),
  };
}

function createMusicArcLengthTable(segments: readonly MusicBezierSegment[]) {
  const sampleCount = segments.length * MUSIC_CURVE_SAMPLES_PER_SEGMENT;
  const samples: MusicArcLengthSample[] = Array.from(
    { length: sampleCount + 1 },
    (_, index) => ({
      ...getMusicBezierPosition(segments, index / sampleCount),
      length: 0,
    }),
  );

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

function getMusicArcLengthPosition(
  table: ReturnType<typeof createMusicArcLengthTable>,
  progress: number,
) {
  const targetLength = clamp(progress, 0, 1) * table.totalLength;
  let lowerIndex = 0;
  let upperIndex = table.samples.length - 1;

  while (lowerIndex + 1 < upperIndex) {
    const middleIndex = Math.floor((lowerIndex + upperIndex) / 2);

    if (table.samples[middleIndex].length < targetLength) {
      lowerIndex = middleIndex;
    } else {
      upperIndex = middleIndex;
    }
  }

  const lowerSample = table.samples[lowerIndex];
  const upperSample = table.samples[upperIndex];
  const sampleLength = upperSample.length - lowerSample.length;
  const sampleProgress =
    sampleLength > 0
      ? (targetLength - lowerSample.length) / sampleLength
      : 0;

  return {
    x: lerp(lowerSample.x, upperSample.x, sampleProgress),
    y: lerp(lowerSample.y, upperSample.y, sampleProgress),
  };
}

const MUSIC_WAVE_ARC_LENGTH_TABLE = createMusicArcLengthTable(
  createMusicBezierSegments(MUSIC_WAVE_ANCHORS),
);
const MUSIC_STEM_ARC_LENGTH_TABLE = createMusicArcLengthTable(
  createMusicBezierSegments(MUSIC_STEM_ANCHORS),
);
const MUSIC_FLAG_OUTER_ARC_LENGTH_TABLE = createMusicArcLengthTable(
  MUSIC_FLAG_OUTER_SEGMENTS,
);
const MUSIC_FLAG_INNER_ARC_LENGTH_TABLE = createMusicArcLengthTable(
  MUSIC_FLAG_INNER_SEGMENTS,
);

function createMusicSweptPoint(
  index: number,
  center: MusicPoint2D,
  tangent: MusicPoint2D,
  radius: number,
  noiseOffset: number,
  haloScale: number,
) {
  const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
  const tangentX = tangent.x / tangentLength;
  const tangentY = tangent.y / tangentLength;
  const normalX = -tangentY;
  const normalY = tangentX;
  const particleLayer = seededNoise(index, noiseOffset);
  const radialProgress = seededNoise(index, noiseOffset + 1);
  const particleRadius =
    particleLayer < 0.72
      ? Math.sqrt(radialProgress) * radius
      : particleLayer < 0.93
        ? radius * (0.78 + radialProgress * 0.38)
        : radius * (1.18 + radialProgress * haloScale);
  const radialAngle = seededNoise(index, noiseOffset + 2) * Math.PI * 2;
  const tangentJitter =
    (seededNoise(index, noiseOffset + 3) * 2 - 1) *
    radius *
    (particleLayer < 0.93 ? 0.12 : 0.46);

  return createMorphPoint(
    center.x +
      normalX * Math.cos(radialAngle) * particleRadius +
      tangentX * tangentJitter,
    center.y +
      normalY * Math.cos(radialAngle) * particleRadius +
      tangentY * tangentJitter,
    Math.sin(radialAngle) * particleRadius * 0.82,
  );
}

function getMusicCurveTangent(
  table: ReturnType<typeof createMusicArcLengthTable>,
  progress: number,
) {
  const tangentOffset = 0.0015;
  const previous = getMusicArcLengthPosition(table, progress - tangentOffset);
  const next = getMusicArcLengthPosition(table, progress + tangentOffset);

  return { x: next.x - previous.x, y: next.y - previous.y };
}

function createMusicWavePoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const progress = (localIndex + 0.5) / componentPoints;
  const center = getMusicArcLengthPosition(
    MUSIC_WAVE_ARC_LENGTH_TABLE,
    progress,
  );
  const tangent = getMusicCurveTangent(
    MUSIC_WAVE_ARC_LENGTH_TABLE,
    progress,
  );
  const amplitude = Math.abs(center.y);
  const envelope = Math.sin(progress * Math.PI) ** 0.55;
  const radius = 0.035 + amplitude * 0.2 + envelope * 0.014;

  return createMusicSweptPoint(index, center, tangent, radius, 81, 0.92);
}

function createMusicHeadPoint(index: number) {
  const particleLayer = seededNoise(index, 121);
  const angle = seededNoise(index, 122) * Math.PI * 2;
  const radialProgress = seededNoise(index, 124);
  const radialScale =
    particleLayer < 0.78
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
  const interiorDepth = Math.sqrt(
    Math.max(0, 1 - Math.min(1, radialScale) ** 2),
  );
  const depthScale = particleLayer < 0.78 ? interiorDepth : 0.28;

  return createMorphPoint(
    -0.18 + localX * Math.cos(tilt) - localY * Math.sin(tilt),
    0.58 + localX * Math.sin(tilt) + localY * Math.cos(tilt),
    (seededNoise(index, 125) * 2 - 1) *
      0.08 *
      (0.35 + depthScale * 0.65),
  );
}

function createMusicStemPoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const progress = (localIndex + 0.5) / componentPoints;
  const center = getMusicArcLengthPosition(
    MUSIC_STEM_ARC_LENGTH_TABLE,
    progress,
  );
  const tangent = getMusicCurveTangent(
    MUSIC_STEM_ARC_LENGTH_TABLE,
    progress,
  );

  return createMusicSweptPoint(
    index,
    center,
    tangent,
    lerp(0.09, 0.055, progress),
    141,
    0.48,
  );
}

function createMusicFlagPoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
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
    const capLayer = seededNoise(index, 171);
    const capRadius =
      capLayer < 0.7
        ? Math.sqrt(seededNoise(index, 172)) * 0.9
        : 0.9 + seededNoise(index, 172) * 0.12;

    return createMorphPoint(
      center.x +
        across.x * Math.cos(angle) * capRadius +
        (tangent.x / acrossLength) *
          Math.sin(angle) *
          acrossLength *
          0.72 *
          capRadius,
      center.y +
        across.y * Math.cos(angle) * capRadius +
        (tangent.y / acrossLength) *
          Math.sin(angle) *
          acrossLength *
          0.72 *
          capRadius,
      (seededNoise(index, 173) * 2 - 1) * 0.008,
    );
  }

  const progress = (localIndex + 0.5) / bodyPoints;
  const outerPosition = getMusicArcLengthPosition(
    MUSIC_FLAG_OUTER_ARC_LENGTH_TABLE,
    progress,
  );
  const innerPosition = getMusicArcLengthPosition(
    MUSIC_FLAG_INNER_ARC_LENGTH_TABLE,
    progress,
  );
  const outerTangent = getMusicCurveTangent(
    MUSIC_FLAG_OUTER_ARC_LENGTH_TABLE,
    progress,
  );
  const innerTangent = getMusicCurveTangent(
    MUSIC_FLAG_INNER_ARC_LENGTH_TABLE,
    progress,
  );
  const tangent = {
    x: outerTangent.x + innerTangent.x,
    y: outerTangent.y + innerTangent.y,
  };
  const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
  const tangentX = tangent.x / tangentLength;
  const tangentY = tangent.y / tangentLength;
  const ribbonWidth = Math.hypot(
    innerPosition.x - outerPosition.x,
    innerPosition.y - outerPosition.y,
  );
  const particleLayer = seededNoise(index, 161);
  const useOuterEdge = seededNoise(index, 162) < 0.5;
  const crossProgress = seededNoise(index, 163);
  const ribbonProgress =
    particleLayer < 0.68
      ? lerp(0.1, 0.9, crossProgress)
      : particleLayer < 0.98
        ? useOuterEdge
          ? lerp(-0.015, 0.025, crossProgress)
          : lerp(0.975, 1.015, crossProgress)
        : useOuterEdge
          ? lerp(-0.05, -0.12, crossProgress)
          : lerp(1.05, 1.12, crossProgress);
  const tangentJitter =
    (seededNoise(index, 164) * 2 - 1) *
    ribbonWidth *
    (particleLayer < 0.98 ? 0.02 : 0.06);

  return createMorphPoint(
    lerp(outerPosition.x, innerPosition.x, ribbonProgress) +
      tangentX * tangentJitter,
    lerp(outerPosition.y, innerPosition.y, ribbonProgress) +
      tangentY * tangentJitter,
    (seededNoise(index, 165) * 2 - 1) *
      Math.min(ribbonWidth, 0.18) *
      (particleLayer < 0.98 ? 0.12 : 0.2),
  );
}

function createMusicPoint(index: number, totalPoints: number) {
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
    return createMusicStemPoint(
      index,
      index - wavePoints - headPoints,
      stemPoints,
    );
  }

  return createMusicFlagPoint(
    index,
    index - flagStart,
    Math.max(1, totalPoints - flagStart),
  );
}

function signedPower(value: number, exponent: number) {
  return Math.sign(value) * Math.pow(Math.abs(value), exponent);
}

function getImageMountainRidge(x: number) {
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
      const progress = clamp((x - start.x) / (end.x - start.x), 0, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);

      return lerp(start.y, end.y, easedProgress);
    }
  }

  return controlPoints[controlPoints.length - 1].y;
}

function createImagePoint(index: number, totalPoints: number) {
  const progress = (index + 0.5) / totalPoints;
  let x: number;
  let y: number;
  let thickness: number;

  if (progress < 0.38) {
    const frameProgress = progress / 0.38;
    const angle = frameProgress * Math.PI * 2;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const normalOffset = (seededNoise(index, 51) * 2 - 1) * 0.035;

    x = signedPower(cosine, 0.48) * (1.02 + normalOffset);
    y = signedPower(sine, 0.48) * (0.9 + normalOffset * 0.82);
    thickness = 0.022;
  } else if (progress < 0.63) {
    const ridgeProgress = (progress - 0.38) / 0.25;

    x = lerp(-0.9, 0.9, ridgeProgress);
    y = getImageMountainRidge(x);
    thickness = 0.032;
  } else if (progress < 0.8) {
    x = lerp(-0.86, 0.86, seededNoise(index, 52));
    y = lerp(
      getImageMountainRidge(x) + 0.035,
      0.73,
      Math.sqrt(seededNoise(index, 53)),
    );
    thickness = 0.045;
  } else if (progress < 0.95) {
    const sunProgress = (progress - 0.8) / 0.15;
    const angle = seededNoise(index, 54) * Math.PI * 2;
    const radius =
      sunProgress < 0.64
        ? 0.205 + (seededNoise(index, 55) * 2 - 1) * 0.025
        : Math.sqrt(seededNoise(index, 56)) * 0.18;

    x = 0.48 + Math.cos(angle) * radius;
    y = -0.34 + Math.sin(angle) * radius;
    thickness = 0.018;
  } else {
    const angle = seededNoise(index, 57) * Math.PI * 2;
    const radius = 1.02 + seededNoise(index, 58) * 0.18;

    x = Math.cos(angle) * radius;
    y = Math.sin(angle) * radius * 0.88;
    thickness = 0.055;
  }

  return createMorphPoint(
    x + (seededNoise(index, 59) * 2 - 1) * thickness,
    y + (seededNoise(index, 60) * 2 - 1) * thickness,
    (seededNoise(index, 61) * 2 - 1) * 0.1,
  );
}

type VideoPoint2D = Readonly<{ x: number; y: number }>;

const VIDEO_BODY_CENTER_Y = 0.32;
const VIDEO_CLAPPER_ANGLE = -0.28;
const VIDEO_CLAPPER_CENTER = { x: -0.04, y: -0.71 } as const;

const VIDEO_PLAY_TRIANGLE = [
  { x: -0.28, y: 0.05 },
  { x: -0.28, y: 0.69 },
  { x: 0.4, y: 0.37 },
] as const;

function rotateVideoPoint(
  point: VideoPoint2D,
  center: VideoPoint2D,
  angle: number,
) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return {
    x: center.x + point.x * cosine - point.y * sine,
    y: center.y + point.x * sine + point.y * cosine,
  };
}

function getVideoSuperellipsePoint(
  progress: number,
  halfWidth: number,
  halfHeight: number,
  exponent = 0.3,
) {
  const angle = progress * Math.PI * 2;

  return {
    x: signedPower(Math.cos(angle), exponent) * halfWidth,
    y: signedPower(Math.sin(angle), exponent) * halfHeight,
  };
}

function getVideoRectanglePerimeterPoint(
  progress: number,
  halfWidth: number,
  halfHeight: number,
) {
  const horizontalLength = halfWidth * 2;
  const verticalLength = halfHeight * 2;
  const perimeter = (horizontalLength + verticalLength) * 2;
  let distance = clamp(progress, 0, 1) * perimeter;

  if (distance <= horizontalLength) {
    return { x: lerp(-halfWidth, halfWidth, distance / horizontalLength), y: -halfHeight };
  }

  distance -= horizontalLength;
  if (distance <= verticalLength) {
    return { x: halfWidth, y: lerp(-halfHeight, halfHeight, distance / verticalLength) };
  }

  distance -= verticalLength;
  if (distance <= horizontalLength) {
    return { x: lerp(halfWidth, -halfWidth, distance / horizontalLength), y: halfHeight };
  }

  distance -= horizontalLength;
  return { x: -halfWidth, y: lerp(halfHeight, -halfHeight, distance / verticalLength) };
}

function getVideoTrianglePerimeterPoint(progress: number) {
  const [start, middle, end] = VIDEO_PLAY_TRIANGLE;
  const edgeLengths = [
    Math.hypot(middle.x - start.x, middle.y - start.y),
    Math.hypot(end.x - middle.x, end.y - middle.y),
    Math.hypot(start.x - end.x, start.y - end.y),
  ];
  const perimeter = edgeLengths.reduce((sum, length) => sum + length, 0);
  let distance = clamp(progress, 0, 1) * perimeter;

  for (let edgeIndex = 0; edgeIndex < edgeLengths.length; edgeIndex += 1) {
    const edgeLength = edgeLengths[edgeIndex];

    if (distance <= edgeLength) {
      const edgeStart = VIDEO_PLAY_TRIANGLE[edgeIndex];
      const edgeEnd = VIDEO_PLAY_TRIANGLE[(edgeIndex + 1) % VIDEO_PLAY_TRIANGLE.length];
      const edgeProgress = distance / edgeLength;

      return {
        x: lerp(edgeStart.x, edgeEnd.x, edgeProgress),
        y: lerp(edgeStart.y, edgeEnd.y, edgeProgress),
      };
    }

    distance -= edgeLength;
  }

  return start;
}

function createVideoBodyFramePoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const progress = (localIndex + 0.5) / componentPoints;
  const boundary = getVideoSuperellipsePoint(progress, 1, 0.6, 0.28);
  const normalOffset = (seededNoise(index, 201) * 2 - 1) * 0.025;

  return createMorphPoint(
    boundary.x * (1 + normalOffset),
    VIDEO_BODY_CENTER_Y + boundary.y * (1 + normalOffset),
    (seededNoise(index, 202) * 2 - 1) * 0.055,
  );
}

function createVideoBodyInteriorPoint(index: number) {
  const y = lerp(-0.13, 0.82, seededNoise(index, 211));
  const cornerTaper = y > 0.68 ? ((y - 0.68) / 0.14) * 0.08 : 0;
  const halfWidth = 0.91 - cornerTaper;

  return createMorphPoint(
    lerp(-halfWidth, halfWidth, seededNoise(index, 212)),
    y,
    (seededNoise(index, 213) * 2 - 1) * 0.04,
  );
}

function createVideoBodyStripPoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const outlinePoints = Math.floor(componentPoints * 0.35);

  if (localIndex < outlinePoints) {
    const point = getVideoRectanglePerimeterPoint(
      (localIndex + 0.5) / Math.max(1, outlinePoints),
      0.98,
      0.1,
    );

    return createMorphPoint(
      point.x + (seededNoise(index, 221) * 2 - 1) * 0.018,
      -0.19 + point.y + (seededNoise(index, 222) * 2 - 1) * 0.018,
      (seededNoise(index, 223) * 2 - 1) * 0.045,
    );
  }

  const stripeIndex = (localIndex - outlinePoints) % 5;
  const stripeCenter = lerp(-0.78, 0.78, stripeIndex / 4);
  const y = lerp(-0.27, -0.11, seededNoise(index, 224));
  const x = clamp(
    stripeCenter +
      (y + 0.19) * 1.15 +
      (seededNoise(index, 225) * 2 - 1) * 0.09,
    -0.94,
    0.94,
  );

  return createMorphPoint(
    x,
    y,
    (seededNoise(index, 226) * 2 - 1) * 0.04,
  );
}

function createVideoRaisedClapperPoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const outlinePoints = Math.floor(componentPoints * 0.38);
  let localPoint: VideoPoint2D;

  if (localIndex < outlinePoints) {
    const boundary = getVideoSuperellipsePoint(
      (localIndex + 0.5) / Math.max(1, outlinePoints),
      1.02,
      0.14,
      0.25,
    );
    const offset = (seededNoise(index, 231) * 2 - 1) * 0.02;

    localPoint = {
      x: boundary.x * (1 + offset),
      y: boundary.y * (1 + offset),
    };
  } else {
    const stripeIndex = (localIndex - outlinePoints) % 5;
    const stripeCenter = lerp(-0.78, 0.78, stripeIndex / 4);
    const y = lerp(-0.105, 0.105, seededNoise(index, 232));

    localPoint = {
      x: clamp(
        stripeCenter +
          y * 1.35 +
          (seededNoise(index, 233) * 2 - 1) * 0.1,
        -0.96,
        0.96,
      ),
      y,
    };
  }

  const point = rotateVideoPoint(
    localPoint,
    VIDEO_CLAPPER_CENTER,
    VIDEO_CLAPPER_ANGLE,
  );

  return createMorphPoint(
    point.x,
    point.y,
    (seededNoise(index, 234) * 2 - 1) * 0.055,
  );
}

function createVideoHingePoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const progress = (localIndex + 0.5) / componentPoints;
  const angle = seededNoise(index, 241) * Math.PI * 2;
  const radius =
    progress < 0.65
      ? 0.16 + (seededNoise(index, 242) * 2 - 1) * 0.018
      : Math.sqrt(seededNoise(index, 242)) * 0.145;

  return createMorphPoint(
    -0.98 + Math.cos(angle) * radius,
    -0.34 + Math.sin(angle) * radius,
    (seededNoise(index, 243) * 2 - 1) * 0.06,
  );
}

function createVideoPlayPoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const outlinePoints = Math.floor(componentPoints * 0.62);
  let point: VideoPoint2D;

  if (localIndex < outlinePoints) {
    const boundary = getVideoTrianglePerimeterPoint(
      (localIndex + 0.5) / Math.max(1, outlinePoints),
    );
    const jitter = (seededNoise(index, 251) * 2 - 1) * 0.018;

    point = { x: boundary.x + jitter, y: boundary.y + jitter * 0.72 };
  } else {
    const [start, middle, end] = VIDEO_PLAY_TRIANGLE;
    const rootProgress = Math.sqrt(seededNoise(index, 252));
    const edgeProgress = seededNoise(index, 253);

    point = {
      x:
        (1 - rootProgress) * start.x +
        rootProgress * (1 - edgeProgress) * middle.x +
        rootProgress * edgeProgress * end.x,
      y:
        (1 - rootProgress) * start.y +
        rootProgress * (1 - edgeProgress) * middle.y +
        rootProgress * edgeProgress * end.y,
    };
  }

  return createMorphPoint(
    point.x,
    point.y,
    (seededNoise(index, 254) * 2 - 1) * 0.055,
  );
}

function createVideoHaloPoint(
  index: number,
  localIndex: number,
  componentPoints: number,
) {
  const bodyHaloPoints = Math.floor(componentPoints * 0.6);
  const scale = 1.06 + seededNoise(index, 261) * 0.1;
  let point: VideoPoint2D;

  if (localIndex < bodyHaloPoints) {
    const boundary = getVideoSuperellipsePoint(
      (localIndex + 0.5) / Math.max(1, bodyHaloPoints),
      1,
      0.6,
      0.28,
    );

    point = {
      x: boundary.x * scale,
      y: VIDEO_BODY_CENTER_Y + boundary.y * scale,
    };
  } else {
    const clapperHaloPoints = Math.max(1, componentPoints - bodyHaloPoints);
    const boundary = getVideoSuperellipsePoint(
      (localIndex - bodyHaloPoints + 0.5) / clapperHaloPoints,
      1.02 * scale,
      0.14 * scale,
      0.25,
    );

    point = rotateVideoPoint(
      boundary,
      VIDEO_CLAPPER_CENTER,
      VIDEO_CLAPPER_ANGLE,
    );
  }

  return createMorphPoint(
    point.x,
    point.y,
    (seededNoise(index, 262) * 2 - 1) * 0.1,
  );
}

function createVideoPoint(index: number, totalPoints: number) {
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
    return createVideoBodyStripPoint(
      index,
      index - bodyStripStart,
      bodyStripPoints,
    );
  }

  if (index < hingeStart) {
    return createVideoRaisedClapperPoint(
      index,
      index - raisedClapperStart,
      raisedClapperPoints,
    );
  }

  if (index < playStart) {
    return createVideoHingePoint(index, index - hingeStart, hingePoints);
  }

  if (index < haloStart) {
    return createVideoPlayPoint(index, index - playStart, playPoints);
  }

  return createVideoHaloPoint(
    index,
    index - haloStart,
    Math.max(1, totalPoints - haloStart),
  );
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
] as const;

const CODE_BRACE_SAMPLES_PER_SEGMENT = 80;

function getCubicBezierCoordinate(
  start: number,
  control1: number,
  control2: number,
  end: number,
  progress: number,
) {
  const inverseProgress = 1 - progress;

  return (
    inverseProgress ** 3 * start +
    3 * inverseProgress ** 2 * progress * control1 +
    3 * inverseProgress * progress ** 2 * control2 +
    progress ** 3 * end
  );
}

function getCodeBraceCurvePosition(progress: number) {
  const scaledProgress = clamp(progress, 0, 1) * CODE_BRACE_SEGMENTS.length;
  const segmentIndex = Math.min(
    CODE_BRACE_SEGMENTS.length - 1,
    Math.floor(scaledProgress),
  );
  const segmentProgress = scaledProgress - segmentIndex;
  const segment = CODE_BRACE_SEGMENTS[segmentIndex];

  return {
    x: getCubicBezierCoordinate(
      segment.start.x,
      segment.control1.x,
      segment.control2.x,
      segment.end.x,
      segmentProgress,
    ),
    y: getCubicBezierCoordinate(
      segment.start.y,
      segment.control1.y,
      segment.control2.y,
      segment.end.y,
      segmentProgress,
    ),
  };
}

function createCodeBraceArcLengthTable() {
  const sampleCount =
    CODE_BRACE_SEGMENTS.length * CODE_BRACE_SAMPLES_PER_SEGMENT;
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

function getCodeBracePosition(progress: number) {
  const { samples, totalLength } = CODE_BRACE_ARC_LENGTH_TABLE;
  const targetLength = clamp(progress, 0, 1) * totalLength;
  let lowerIndex = 0;
  let upperIndex = samples.length - 1;

  while (lowerIndex + 1 < upperIndex) {
    const middleIndex = Math.floor((lowerIndex + upperIndex) / 2);

    if (samples[middleIndex].length < targetLength) {
      lowerIndex = middleIndex;
    } else {
      upperIndex = middleIndex;
    }
  }

  const lowerSample = samples[lowerIndex];
  const upperSample = samples[upperIndex];
  const sampleLength = upperSample.length - lowerSample.length;
  const sampleProgress =
    sampleLength > 0
      ? (targetLength - lowerSample.length) / sampleLength
      : 0;

  return {
    x: lerp(lowerSample.x, upperSample.x, sampleProgress),
    y: lerp(lowerSample.y, upperSample.y, sampleProgress),
  };
}

function createCodePoint(index: number, totalPoints: number) {
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
  const particleLayer = seededNoise(index, 71);
  const radialProgress = seededNoise(index, 72);
  const particleRadius =
    particleLayer < 0.8
      ? radialProgress ** 1.35 * bodyRadius
      : particleLayer < 0.96
        ? bodyRadius * (0.72 + radialProgress * 0.38)
        : bodyRadius * (1.12 + radialProgress * 0.48);
  const radialAngle = seededNoise(index, 73) * Math.PI * 2;
  const tangentJitter =
    (seededNoise(index, 74) * 2 - 1) *
    bodyRadius *
    (particleLayer < 0.96 ? 0.1 : 0.22);

  return createMorphPoint(
    position.x +
      normalX * Math.cos(radialAngle) * particleRadius +
      normalizedTangentX * tangentJitter,
    position.y +
      normalY * Math.cos(radialAngle) * particleRadius +
      normalizedTangentY * tangentJitter,
    Math.sin(radialAngle) * particleRadius * 0.82,
  );
}

/**
 * Rest geometry of the "bloom" shape, shared with the audio reaction that
 * stretches it: a pulsing core, a corona of spectrum rays and expanding
 * shockwave rings. Units are shape-space, scaled by `sphereRadius`.
 */
export const BLOOM_GEOMETRY = {
  coreRadius: 0.2,
  rayCount: 40,
  rayRoot: 0.3,
  rayRestLength: 0.22,
  waveInner: 0.34,
  waveSpan: 0.86,
  waveRestPhases: [0.36, 0.64, 0.92],
} as const;

const BLOOM_CORE_SHARE = 0.18;
const BLOOM_RAY_SHARE = 0.48;

function createBloomCorePoint(index: number) {
  const vertical = seededNoise(index, 311) * 2 - 1;
  const azimuth = seededNoise(index, 312) * Math.PI * 2;
  const horizontal = Math.sqrt(Math.max(0, 1 - vertical * vertical));
  const depth =
    seededNoise(index, 313) < 0.6 ? 0.94 + seededNoise(index, 314) * 0.06 : Math.cbrt(seededNoise(index, 314));
  const radius = BLOOM_GEOMETRY.coreRadius * depth;

  return createMorphPoint(
    Math.cos(azimuth) * horizontal * radius,
    vertical * radius,
    Math.sin(azimuth) * horizontal * radius,
    "core",
  );
}

// Rays are laid out around the core from the bottom, so the renderer can map
// each one to a spectrum band from its own angle.
function createBloomRayPoint(index: number, localIndex: number, componentPoints: number) {
  const { rayCount, rayRoot, rayRestLength } = BLOOM_GEOMETRY;
  const perRay = Math.max(1, Math.floor(componentPoints / rayCount));
  const ray = localIndex % rayCount;
  const step = Math.floor(localIndex / rayCount);
  const along = clamp((step + seededNoise(index, 321)) / perRay, 0, 1);
  const angle = ((ray + 0.5) / rayCount) * Math.PI * 2 + (seededNoise(index, 322) * 2 - 1) * 0.012;
  const radius = rayRoot + along * rayRestLength;

  return createMorphPoint(
    Math.sin(angle) * radius,
    Math.cos(angle) * radius,
    (seededNoise(index, 323) * 2 - 1) * 0.02,
    "ray",
  );
}

function createBloomWavePoint(index: number, localIndex: number) {
  const { waveInner, waveSpan, waveRestPhases } = BLOOM_GEOMETRY;
  const phase = waveRestPhases[localIndex % waveRestPhases.length];
  const angle = seededNoise(index, 331) * Math.PI * 2;
  const radius = waveInner + phase * waveSpan + (seededNoise(index, 332) * 2 - 1) * 0.018;

  return createMorphPoint(
    Math.sin(angle) * radius,
    Math.cos(angle) * radius,
    (seededNoise(index, 333) * 2 - 1) * 0.03,
    "wave",
  );
}

function createBloomPoint(index: number, totalPoints: number) {
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

function generateCustomShapePoints(shape: MorphShape, totalPoints: number) {
  const createPoint =
    shape === "bloom"
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

  return Array.from({ length: totalPoints }, (_, index) =>
    createPoint(index, totalPoints),
  );
}

export function generateShapePoints(shape: MorphShape, totalPoints: number): MorphPoint[] {
  const safeTotal = Math.max(1, Math.floor(totalPoints));
  const customPoints = generateCustomShapePoints(shape, safeTotal);

  if (customPoints) {
    return customPoints;
  }

  const points: MorphPoint[] = [];
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

export function getParticleCloudPoint(index: number, settings: MorphCloudSettings, timeValue: number): MorphPoint {
  const dirX = seededNoise(index, 1) * 2 - 1;
  const dirY = seededNoise(index, 2) * 2 - 1;
  const dirZ = seededNoise(index, 3) * 2 - 1;
  const length = Math.max(0.001, Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ));
  const baseScale = settings.spread * settings.objectScale;
  const radius = (0.35 + Math.cbrt(seededNoise(index, 4)) * 0.65) * baseScale;
  const speed = 0.8 + seededNoise(index, 5) * 1.8;
  const phase = timeValue * speed + seededNoise(index, 6) * Math.PI * 2;
  const wobble = settings.chaos * 0.18;
  let x = (dirX / length) * radius;
  let y = (dirY / length) * radius;
  let z = (dirZ / length) * radius;

  if (settings.shape === "cube") {
    x = (seededNoise(index, 1) * 2 - 1) * baseScale;
    y = (seededNoise(index, 2) * 2 - 1) * baseScale;
    z = (seededNoise(index, 3) * 2 - 1) * baseScale;
  } else if (settings.shape === "pyramid") {
    const heightLevel = seededNoise(index, 2);
    const layerSize = 1 - heightLevel * 0.86;
    x = (seededNoise(index, 1) * 2 - 1) * baseScale * layerSize;
    y = (heightLevel * 2 - 1) * baseScale;
    z = (seededNoise(index, 3) * 2 - 1) * baseScale * layerSize;
  } else if (settings.shape === "ring") {
    const angle = seededNoise(index, 1) * Math.PI * 2;
    const ringRadius = baseScale * (0.65 + seededNoise(index, 4) * 0.35);
    x = Math.cos(angle) * ringRadius;
    y = (seededNoise(index, 2) * 2 - 1) * baseScale * 0.22;
    z = Math.sin(angle) * ringRadius;
  }

  if (settings.vortexStrength > 0) {
    const radial = Math.sqrt(x * x + z * z);
    const vortexPhase = timeValue * settings.vortexSpeed + seededNoise(index, 9) * Math.PI * 2 + y * 0.9;
    const vortexAngle = Math.atan2(z, x) + vortexPhase * settings.vortexStrength;
    x = Math.cos(vortexAngle) * radial;
    z = Math.sin(vortexAngle) * radial;
    y += Math.sin(vortexPhase) * baseScale * settings.vortexStrength * 0.08;
  }

  return {
    origX: x + Math.sin(phase) * wobble,
    origY: y + Math.cos(phase * 0.9) * wobble,
    origZ: z + Math.sin(phase * 1.15) * wobble,
    theta: seededNoise(index, 7) * Math.PI * 2 + Math.sin(phase) * settings.chaos,
    phiZ: seededNoise(index, 8) * Math.PI * 2 + Math.cos(phase) * settings.chaos,
  };
}

// A blended point keeps the part of the shape it is heading to, or of the one
// it leaves when the target has none, so an audio reaction fades by its
// amount instead of snapping when a shape swaps in or out.
export function blendPoint(fromPoint: MorphPoint, toPoint: MorphPoint, amount: number): MorphPoint {
  return {
    part: toPoint.part ?? fromPoint.part,
    origX: lerp(fromPoint.origX, toPoint.origX, amount),
    origY: lerp(fromPoint.origY, toPoint.origY, amount),
    origZ: lerp(fromPoint.origZ, toPoint.origZ, amount),
    theta: lerp(fromPoint.theta, toPoint.theta, amount),
    phiZ: lerp(fromPoint.phiZ, toPoint.phiZ, amount),
  };
}
