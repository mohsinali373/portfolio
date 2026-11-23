import { lazy, Suspense, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { navLinks } from './data/content';
import { hasWebGL } from './lib/environment';
import { initReveals } from './lib/reveals';
import { initLayoutRefresh, initSmoothScroll } from './lib/smoothScroll';
import { useTheme } from './lib/useTheme';
import { Nav } from './components/nav/Nav';
import { Hero } from './components/hero/Hero';
import { Work } from './components/work/Work';
import { Stack } from './components/stack/Stack';
import { Process } from './components/process/Process';
import { About } from './components/about/About';
import { Footer } from './components/footer/Footer';
import { Cursor } from './components/ui/Cursor';

// three.js + R3F live in their own chunk so text paints before WebGL loads.
const Stage = lazy(() => import('./components/stage/Stage'));

const ACTIVE_SECTION_MARGIN = '-45% 0px -50% 0px';

function useActiveSection() {
  const [activeId, setActiveId] = useState('');
  useEffect(() => {
    const sections = ['top', ...navLinks.map((link) => link.id)]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id === 'top' ? '' : entry.target.id);
        });
      },
      { rootMargin: ACTIVE_SECTION_MARGIN },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return activeId;
}

export function App() {
  const { theme, toggleTheme } = useTheme();
  const activeId = useActiveSection();
  const [canRender3D] = useState(hasWebGL);

  // Child effects (hero intro, process line) run before this one, so their
  // triggers exist before reveals measure the page.
  useEffect(() => {
    const stopSmoothScroll = initSmoothScroll();
    const stopLayoutRefresh = initLayoutRefresh();
    const stopReveals = initReveals();
    ScrollTrigger.refresh();
    return () => {
      stopReveals();
      stopLayoutRefresh();
      stopSmoothScroll();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {canRender3D && (
        <Suspense fallback={null}>
          <Stage theme={theme} />
        </Suspense>
      )}
      <div className="grain" aria-hidden="true" />
      <Nav theme={theme} onToggleTheme={toggleTheme} activeId={activeId} />
      <main id="main">
        <Hero />
        <Work />
        <Stack />
        <Process />
        <About />
      </main>
      <Footer theme={theme} onToggleTheme={toggleTheme} />
      <Cursor />
    </>
  );
}
