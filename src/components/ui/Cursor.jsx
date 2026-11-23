import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { hasFinePointer, prefersReducedMotion } from '../../lib/environment';
import './cursor.css';

const INTERACTIVE = 'a, button, [role="tab"], [role="switch"], label, .case__visual';
const TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"]';

/**
 * Custom cursor for mouse/trackpad users: a precise dot and a trailing ring
 * that swells over interactive elements and hides over text fields (where the
 * native I-beam returns). Touch devices keep the system cursor untouched.
 */
export function Cursor() {
  const dotRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const ringRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring || !hasFinePointer()) return undefined;

    const root = document.documentElement;
    root.classList.add('has-cursor');
    const lag = prefersReducedMotion() ? 0 : 0.38;
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: lag, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: lag, ease: 'power3.out' });

    const setState = (name, isOn) => root.classList.toggle(name, isOn);

    const handleMove = (event) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      setState('cursor-visible', true);
      const target = event.target instanceof Element ? event.target : null;
      setState('cursor-text', Boolean(target?.closest(TEXT_FIELDS)));
      setState('cursor-hover', Boolean(target?.closest(INTERACTIVE)));
    };
    const handleDown = () => setState('cursor-down', true);
    const handleUp = () => setState('cursor-down', false);
    const handleLeave = () => setState('cursor-visible', false);

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    document.addEventListener('pointerleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointerleave', handleLeave);
      root.classList.remove('has-cursor', 'cursor-visible', 'cursor-text', 'cursor-hover', 'cursor-down');
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
