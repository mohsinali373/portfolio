// Device & preference detection used to scale effects down where needed.

/** @returns {boolean} */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Coarse pointer or narrow viewport → treat as a mobile-class device. @returns {boolean} */
export function isMobileClass() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse), (max-width: 767px)').matches;
}

/** @returns {boolean} */
export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Fine pointer devices get hover-only flourishes (cursor-follow previews, magnetic). @returns {boolean} */
export function hasFinePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
