import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './environment';

const STORAGE_KEY = 'ma-theme';

/** @returns {'dark' | 'light'} */
function readInitialTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' ? 'light' : 'dark';
}

/**
 * Dark/light theme with localStorage persistence. The pre-paint script in
 * index.html applies the saved value before React mounts. When supported, the
 * switch is revealed as a circle growing from the control that was pressed.
 * @returns {{ theme: 'dark' | 'light', toggleTheme: (origin?: { x: number, y: number }) => void }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F8F8FA' : '#0A0A0C');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode, blocked site data) — theme still works for this visit.
    }
  }, [theme]);

  const toggleTheme = useCallback((origin) => {
    const flip = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    const canAnimate = typeof document.startViewTransition === 'function' && !prefersReducedMotion();
    if (!canAnimate) {
      flip();
      return;
    }
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', `${origin?.x ?? window.innerWidth - 40}px`);
    root.style.setProperty('--reveal-y', `${origin?.y ?? 40}px`);
    document.startViewTransition(() => {
      flushSync(flip);
    });
  }, []);

  return { theme, toggleTheme };
}
