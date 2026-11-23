import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionStore } from './motionStore';
import { prefersReducedMotion } from './environment';

gsap.registerPlugin(ScrollTrigger);

/** @type {Lenis | null} */
let lenis = null;

/**
 * Starts Lenis inertial scrolling driven by the GSAP ticker so ScrollTrigger
 * and Lenis share one clock. Skipped entirely for reduced-motion users.
 * @returns {() => void} cleanup
 */
export function initSmoothScroll() {
  if (prefersReducedMotion()) return () => {};

  lenis = new Lenis({
    lerp: 0.085, // slightly softer inertia so the page and the 3D form glide together
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  const onScroll = (instance) => {
    motionStore.velocity = instance.velocity;
    ScrollTrigger.update();
  };
  lenis.on('scroll', onScroll);

  const tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

/**
 * Scroll to a section id (or 'top') using Lenis when active, native otherwise.
 * @param {string} id
 */
export function scrollToId(id) {
  const target = id === 'top' ? 0 : document.getElementById(id);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    return;
  }
  if (target === 0) window.scrollTo({ top: 0 });
  else target.scrollIntoView();
}

/** @param {boolean} locked */
export function setScrollLocked(locked) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/**
 * Re-measure ScrollTrigger positions once web fonts and images have settled.
 * @returns {() => void} cleanup
 */
export function initLayoutRefresh() {
  const refreshAfterLoad = () => ScrollTrigger.refresh();
  if (document.fonts?.ready) document.fonts.ready.then(refreshAfterLoad);
  window.addEventListener('load', refreshAfterLoad);
  return () => window.removeEventListener('load', refreshAfterLoad);
}
