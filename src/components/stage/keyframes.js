// What the 3D form becomes in each section, in scroll order (see STAGE_SECTIONS).
// Position and size are NOT stored here: the form docks into each section's
// `[data-stage-slot]` element, measured live, so it lands in its place on any
// screen size and becomes part of that section's composition.
//
// shape: superellipsoid half-extents · exp: squareness (2 = round, 7+ = boxy)
// morph: 0 = liquid sphere, 1 = full shape · amp/freq: liquid surface motion
// rx/ry/rz: orientation · rings: ring size (0 hides) · ringTilt / ringSpread: ring pose
// fill: share of the slot the form occupies · presence: canvas opacity

/** @typedef {{shape:number[],exp:number,morph:number,amp:number,freq:number,rx:number,ry:number,rz:number,rings:number,ringTilt:number,ringSpread:number,fill:number,presence:number}} StageFrame */

/** Faceplate drawn on each section's form (see faceplates.js); null = bare liquid metal. */
export const stageFaces = [null, 'site', 'code', 'rack', null, null];

/** @type {StageFrame[]} */
export const stageFrames = [
  // Hero — the liquid drop: raw material before it is shaped.
  { shape: [1, 1, 1], exp: 2, morph: 0, amp: 0.14, freq: 0.75, rx: 0.15, ry: -0.4, rz: 0.08, rings: 1, ringTilt: 0.3, ringSpread: 0, fill: 1, presence: 1 },
  // Work — a slim screen panel showing a storefront: the websites themselves.
  { shape: [1.6, 1.0, 0.1], exp: 6, morph: 1, amp: 0.01, freq: 1.1, rx: -0.06, ry: -0.26, rz: 0.02, rings: 0, ringTilt: 0, ringSpread: 0, fill: 0.95, presence: 1 },
  // Stack — a rounded module block with a code face: components and packages.
  { shape: [1, 1, 1], exp: 6, morph: 1, amp: 0.012, freq: 1.0, rx: 0.22, ry: 0.4, rz: 0, rings: 0, ringTilt: 0, ringSpread: 0, fill: 0.72, presence: 1 },
  // Process — a server tower with rack LEDs and bands: "from brief to live server".
  { shape: [0.62, 1.3, 0.72], exp: 7, morph: 1, amp: 0.008, freq: 1.2, rx: 0.08, ry: 0.32, rz: 0, rings: 0.62, ringTilt: 0, ringSpread: 0.48, fill: 0.9, presence: 1 },
  // About — a calm core in orbit: the person behind the work.
  { shape: [1, 1, 1], exp: 2, morph: 0, amp: 0.08, freq: 0.7, rx: 0.2, ry: 2.2, rz: -0.2, rings: 0.92, ringTilt: 1.15, ringSpread: 0, fill: 0.7, presence: 1 },
  // Footer — a wide liquid pool glowing under the frosted glass.
  { shape: [1.9, 0.95, 0.14], exp: 2.4, morph: 1, amp: 0.05, freq: 0.8, rx: -0.08, ry: 0, rz: 0, rings: 0, ringTilt: 0, ringSpread: 0, fill: 0.95, presence: 1 },
];

// Share of each hand-off where the form rides its current slot, and again
// where it already rides the next one. The middle is the scroll-scrubbed
// flight — kept long so the form travels at an unhurried pace.
const HOLD = 0.12;

// Sine ease-in-out: gentler acceleration than smoothstep, no sudden mid-flight burst.
const smooth = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/**
 * Scroll-scrubbed position along the slot track. Pure function of where the
 * slots are on screen right now, so the form moves exactly as the page scrolls
 * and stops when scrolling stops.
 * @param {number[]} centres slot centres relative to the viewport centre (px, + = below)
 * @returns {{ from: number, to: number, t: number }}
 */
export function scrollSegment(centres) {
  const last = centres.length - 1;
  let from = 0;
  for (let i = 0; i <= last; i++) {
    if (centres[i] <= 0) from = i;
  }
  if (centres[0] > 0 || from === last) return { from, to: from, t: 0 };
  const to = from + 1;
  const span = centres[to] - centres[from];
  const raw = span > 0 ? -centres[from] / span : 1;
  const local = Math.min(Math.max((raw - HOLD) / (1 - 2 * HOLD), 0), 1);
  return { from, to, t: smooth(local) };
}

/**
 * Blend two frames into `out` (reused every frame — no per-frame allocation).
 * @param {StageFrame} a  @param {StageFrame} b  @param {number} t  @param {StageFrame} out
 */
export function blendFrames(a, b, t, out) {
  for (const key in a) {
    if (key === 'shape') {
      for (let i = 0; i < 3; i++) out.shape[i] = a.shape[i] + (b.shape[i] - a.shape[i]) * t;
    } else {
      out[key] = a[key] + (b[key] - a[key]) * t;
    }
  }
  return out;
}
