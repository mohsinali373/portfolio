import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './environment';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-reveal for any element marked `data-reveal`. Content stays visible
 * without JS and for reduced-motion users (initial state is set from JS only).
 * Also animates `[data-count]` numbers when they enter the viewport.
 * @returns {() => void} cleanup
 */
export function initReveals() {
  if (prefersReducedMotion()) return () => {};

  const ctx = gsap.context(() => {
    gsap.set('[data-reveal]', { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    });

    gsap.utils.toArray('[data-count]').forEach((el) => {
      const node = /** @type {HTMLElement} */ (el);
      const end = Number(node.dataset.count);
      if (!Number.isFinite(end)) return;
      const counter = { value: 0 };
      node.textContent = '0';
      gsap.to(counter, {
        value: end,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: node, start: 'top 90%', once: true },
        onUpdate: () => {
          node.textContent = String(Math.round(counter.value));
        },
      });
    });
  });

  return () => ctx.revert();
}
