// Paints the synthetic picture the sorting placeholder slices into strips.
// Scene coordinates are fractions of the painted surface so a square or
// portrait frame keeps its composition instead of stretching a landscape one.

// Canvas cannot resolve custom properties, so the tonal ramp repeats the
// literal values of --color-neutral-700/-720/-800/-950 and -510.
const RAMP_TOP = "#222627";
const RAMP_MIDDLE = "#20242d";
const RAMP_BOTTOM = "#191d1f";
const PLANE_DISTANT = "#222627";
const PLANE_MID = "#191d1f";
const PLANE_FOREGROUND = "#131718";
const DISC_FILL = "#383b3c";
const ALIGNMENT_LINE = "rgb(242 246 255 / 0.026)";

const LONGEST_SIDE = 1200;
// The mark has a viewBox but no intrinsic width or height, so it is requested
// at a fixed raster size before it is scaled into the scene.
const LOGO_SOURCE = "/images/logos/SVG/hummingbird.svg";
const LOGO_RASTER_SIZE = 512;

const ALIGNMENT_LINE_FRACTIONS = [0.2, 0.4, 0.6, 0.8];
const DISC_CENTRE = { x: 0.775, y: 0.22 };
const DISC_RADIUS_FRACTION = 68 / 750;
const LOGO_SIZE_FRACTION = 160 / 750;
const LOGO_ORIGIN_FRACTION = { x: 68 / 750, y: 70 / 750 };

// Ridge lines as [x, y] fractions, closed against the bottom edge.
const DISTANT_RIDGE = [
  [0, 0.807], [0.171, 0.56], [0.304, 0.707], [0.508, 0.42],
  [0.708, 0.72], [0.867, 0.547], [1, 0.707],
];
const MID_RIDGE = [
  [0, 0.907], [0.25, 0.68], [0.417, 0.833], [0.629, 0.607],
  [0.825, 0.853], [1, 0.74],
];
const FOREGROUND_RIDGE = [
  [0, 0.965], [0.208, 0.835], [0.368, 0.941], [0.575, 0.78],
  [0.729, 0.925], [0.871, 0.832], [1, 0.907],
];

let logoRequest: Promise<HTMLImageElement | null> | null = null;

function loadLogo() {
  logoRequest ??= new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.width = LOGO_RASTER_SIZE;
    image.height = LOGO_RASTER_SIZE;
    image.onload = () => resolve(image);
    // No mark is preferable to no backdrop.
    image.onerror = () => resolve(null);
    image.src = LOGO_SOURCE;
  });

  return logoRequest;
}

function fillRidge(
  context: CanvasRenderingContext2D,
  ridge: number[][],
  width: number,
  height: number,
  fill: string,
) {
  context.fillStyle = fill;
  context.beginPath();
  context.moveTo(ridge[0][0] * width, ridge[0][1] * height);
  for (const [x, y] of ridge.slice(1)) context.lineTo(x * width, y * height);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();
}

export function backdropSurfaceSize(aspectRatio: number) {
  return aspectRatio >= 1
    ? { width: LONGEST_SIDE, height: Math.round(LONGEST_SIDE / aspectRatio) }
    : { width: Math.round(LONGEST_SIDE * aspectRatio), height: LONGEST_SIDE };
}

export async function paintImagePlaceholderBackdrop(aspectRatio: number) {
  const logo = await loadLogo();
  const { width, height } = backdropSurfaceSize(aspectRatio);
  const shortestSide = Math.min(width, height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  // OpenJM tonal ramp: the image reads as part of the instrument chassis.
  const ramp = context.createLinearGradient(0, 0, 0, height);
  ramp.addColorStop(0, RAMP_TOP);
  ramp.addColorStop(0.52, RAMP_MIDDLE);
  ramp.addColorStop(1, RAMP_BOTTOM);
  context.fillStyle = ramp;
  context.fillRect(0, 0, width, height);

  // A few quiet alignment lines instead of a decorative full grid.
  context.strokeStyle = ALIGNMENT_LINE;
  context.lineWidth = 1;
  for (const fraction of ALIGNMENT_LINE_FRACTIONS) {
    const y = Math.round(fraction * height) + 0.5;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  // Neutral counterweight to the hummingbird mark.
  context.save();
  context.globalAlpha = 0.72;
  context.fillStyle = DISC_FILL;
  context.beginPath();
  context.arc(
    DISC_CENTRE.x * width,
    DISC_CENTRE.y * height,
    DISC_RADIUS_FRACTION * shortestSide,
    0,
    Math.PI * 2,
  );
  context.fill();
  context.restore();

  fillRidge(context, DISTANT_RIDGE, width, height, PLANE_DISTANT);
  fillRidge(context, MID_RIDGE, width, height, PLANE_MID);
  fillRidge(context, FOREGROUND_RIDGE, width, height, PLANE_FOREGROUND);

  // Brand mark: unframed, unlabelled, part of the generated composition itself.
  if (logo) {
    const logoSize = LOGO_SIZE_FRACTION * shortestSide;
    context.save();
    context.globalAlpha = 0.97;
    context.drawImage(
      logo,
      LOGO_ORIGIN_FRACTION.x * shortestSide,
      LOGO_ORIGIN_FRACTION.y * shortestSide,
      logoSize,
      logoSize,
    );
    context.restore();
  }

  return canvas.toDataURL("image/png");
}
