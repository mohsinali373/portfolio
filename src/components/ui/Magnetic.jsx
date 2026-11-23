import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { hasFinePointer, prefersReducedMotion } from '../../lib/environment';

const PULL = 0.3; // clamp so the element never leaves its own hit area

/**
 * Wraps a single focal element with a subtle magnetic pull toward the cursor.
 * Use on at most 1–2 elements per screen. No-op on touch / reduced motion.
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export function Magnetic({ children, className }) {
  const ref = useRef(/** @type {HTMLSpanElement | null} */ (null));

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });

    const handlePointerMove = (event) => {
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * PULL);
      yTo((event.clientY - rect.top - rect.height / 2) * PULL);
    };
    const handlePointerLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <span ref={ref} className={className} style={{ display: 'inline-flex' }}>
      {children}
    </span>
  );
}
