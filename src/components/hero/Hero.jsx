import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { hero, profile } from '../../data/content';
import { prefersReducedMotion } from '../../lib/environment';
import { scrollToId } from '../../lib/smoothScroll';
import { Icon } from '../ui/Icon';
import { Magnetic } from '../ui/Magnetic';
import './hero.css';

gsap.registerPlugin(SplitText);

/**
 * Hero: the giant name is painted *behind* the WebGL canvas (z-index -1 in the
 * root stacking context), so the liquid drop floats in front of the letters.
 */
export function Hero() {
  const rootRef = useRef(/** @type {HTMLElement | null} */ (null));

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const split = SplitText.create('.hero__name-line', { type: 'chars', mask: 'chars' });
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: 0.2 })
        .from(split.chars, { yPercent: 110, duration: 1.5, stagger: 0.035 })
        .from('[data-hero-fade]', { autoAlpha: 0, y: 16, duration: 1, stagger: 0.07 }, '-=1.05');

      gsap.to('.hero__name', {
        yPercent: 14,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const handleWorkClick = (event) => {
    event.preventDefault();
    scrollToId('work');
  };

  return (
    <section id="top" ref={rootRef} className="hero" aria-labelledby="hero-title">
      <div className="container hero__top" data-hero-fade>
        <p className="hero__status">
          <span className="hero__dot" aria-hidden="true" />
          Available for new projects
        </p>
        <p className="hero__where">
          {profile.city} <span aria-hidden="true">—</span> 4 years shipping
        </p>
      </div>

      <h1 id="hero-title" className="hero__name">
        <span className="hero__name-line">{profile.firstName}</span>
        <span className="hero__name-line hero__name-line--light">{profile.lastName}</span>
      </h1>

      <div className="stage-slot hero__slot" data-stage-slot="top" aria-hidden="true" />

      <div className="container hero__bottom">
        <div className="hero__role" data-hero-fade>
          <p className="hero__role-title">{profile.role}</p>
          <p className="hero__core">{hero.core.join(' · ')}</p>
        </div>
        <p className="hero__lead" data-hero-fade>
          {hero.lead}
        </p>
        <div className="hero__ctas" data-hero-fade>
          <Magnetic>
            <a className="btn btn--primary" href="#work" onClick={handleWorkClick}>
              View selected work
              <Icon name="arrowUpRight" />
            </a>
          </Magnetic>
          <a className="btn btn--ghost" href={profile.resumeUrl} download>
            Download CV
            <Icon name="download" />
          </a>
        </div>
      </div>
    </section>
  );
}
