import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { process } from '../../data/content';
import './process.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Four steps on one line. The line fills as the section scrolls through the
 * viewport, and each step lights up as the fill reaches it. No cards, no pin.
 */
export function Process() {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const stepsRef = useRef(/** @type {HTMLOListElement | null} */ (null));

  useEffect(() => {
    const steps = stepsRef.current;
    if (!steps) return undefined;
    const trigger = ScrollTrigger.create({
      trigger: steps,
      start: 'top 80%',
      end: 'bottom 45%',
      scrub: true,
      onUpdate: (self) => steps.style.setProperty('--progress', self.progress.toFixed(3)),
    });
    return () => trigger.kill();
  }, []);

  const lastIndex = process.length - 1;

  return (
    <section id="process" ref={sectionRef} className="section process" aria-labelledby="process-title">
      <div className="container">
        <header className="process__head">
          <div>
            <p className="eyebrow" data-reveal>
              Process
            </p>
            <h2 id="process-title" className="section-head__title" data-reveal>
              From brief <em>to live server.</em>
            </h2>
          </div>
          <div className="stage-slot process__slot" data-stage-slot="process" aria-hidden="true" />
        </header>

        <ol ref={stepsRef} className="process__steps" style={{ '--progress': 0 }}>
          <span className="process__rail" aria-hidden="true">
            <span className="process__fill" />
          </span>
          {process.map((step, index) => (
            <li key={step.index} className="process__step" style={{ '--at': index / lastIndex }} data-reveal>
              <span className="process__node" aria-hidden="true" />
              <span className="process__index">{step.index}</span>
              <h3 className="process__title">{step.title}</h3>
              <p className="process__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
