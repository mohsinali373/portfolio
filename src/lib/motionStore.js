// Frame-loop shared state.
// This is intentionally a single mutable object: it is written by scroll/pointer
// listeners and read inside the WebGL render loop every frame. Routing it through
// React state would re-render the tree 60x per second.

export const motionStore = {
  /** Lenis scroll velocity (px per frame, signed). */
  velocity: 0,
  /** Pointer in normalised device coords, -1..1. */
  pointerX: 0,
  pointerY: 0,
  /** Rises when the pointer moves, decays in the render loop. */
  pointerEnergy: 0,
};

/** Section ids in scroll order. Each owns a `[data-stage-slot]` element the 3D form docks into. */
export const STAGE_SECTIONS = ['top', 'work', 'stack', 'process', 'about', 'contact'];
