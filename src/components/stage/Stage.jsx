import { Component, Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { motionStore } from '../../lib/motionStore';
import { isMobileClass, prefersReducedMotion } from '../../lib/environment';
import { LiquidCore } from './LiquidCore';
import { StudioLights } from './StudioLights';
import './stage.css';

// DPR ranges: capped at 2 on desktop (3x adds GPU cost with no visible gain),
// 1.5 on phones; PerformanceMonitor steps down further if frames drop.
const DPR = {
  desktop: { min: 1, start: 1.75, max: 2 },
  mobile: { min: 0.85, start: 1.25, max: 1.5 },
};

const POINTER_GAIN = 2.2;
const MAX_POINTER_ENERGY = 1.5;

function usePointerTracking(isEnabled) {
  useEffect(() => {
    if (!isEnabled) return undefined;
    const handlePointerMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      const travel = Math.hypot(x - motionStore.pointerX, y - motionStore.pointerY);
      motionStore.pointerX = x;
      motionStore.pointerY = y;
      motionStore.pointerEnergy = Math.min(motionStore.pointerEnergy + travel * POINTER_GAIN, MAX_POINTER_ENERGY);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isEnabled]);
}

/** In reduced-motion mode the canvas renders on demand: one frame per scroll. */
function RenderOnScroll() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const handleScroll = () => invalidate();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [invalidate]);
  return null;
}

/**
 * Render on the GSAP ticker, which also drives Lenis. This component mounts
 * after smooth scroll is set up, so its tick runs after Lenis has scrolled in
 * the same frame — slot measurements are never a frame stale, and the form
 * scrolls in lock-step with the page.
 */
function ScrollSyncedLoop() {
  const advance = useThree((state) => state.advance);
  useEffect(() => {
    const tick = (time) => advance(time);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);
  return null;
}

/** WebGL failures must never take the page down — fall back to the CSS backdrop. */
class StageBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <div className="stage__fallback" />;
    return this.props.children;
  }
}

/**
 * Fixed full-viewport WebGL stage behind the page content.
 * @param {{ theme: 'dark' | 'light' }} props
 */
export default function Stage({ theme }) {
  const [isLowPower] = useState(isMobileClass);
  const [isReduced] = useState(prefersReducedMotion);
  const range = isLowPower ? DPR.mobile : DPR.desktop;
  const [dpr, setDpr] = useState(range.start);

  usePointerTracking(!isReduced);

  const handleDecline = () => setDpr((value) => Math.max(range.min, +(value - 0.25).toFixed(2)));
  const handleIncline = () => setDpr((value) => Math.min(range.max, +(value + 0.25).toFixed(2)));

  return (
    <div className="stage" aria-hidden="true">
      <StageBoundary>
        <Canvas
          dpr={dpr}
          frameloop={isReduced ? 'demand' : 'never'}
          camera={{ position: [0, 0, 7.5], fov: 32, near: 0.1, far: 50 }}
          gl={{ antialias: !isLowPower, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.setClearColor(0x000000, 0);
          }}
        >
          <PerformanceMonitor onDecline={handleDecline} onIncline={handleIncline} flipflops={3} />
          <Suspense fallback={null}>
            <StudioLights theme={theme} />
          </Suspense>
          <LiquidCore theme={theme} isLowPower={isLowPower} isReduced={isReduced} />
          {isReduced ? <RenderOnScroll /> : <ScrollSyncedLoop />}
        </Canvas>
      </StageBoundary>
    </div>
  );
}
