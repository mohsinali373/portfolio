import { useEffect, useRef, useState } from 'react';
import { footerColumns, profile, socials } from '../../data/content';
import { prefersReducedMotion } from '../../lib/environment';
import { scrollToId } from '../../lib/smoothScroll';
import { Icon } from '../ui/Icon';
import { ContactForm } from './ContactForm';
import { playLiquidReveal } from './liquidEdge';
import { mountWaterLens } from './waterLens';
import './footer.css';

// Start the liquid-fill as soon as the footer edge appears; content is never hidden before it.
const REVEAL_THRESHOLD = 0.05;

const CREST = { dark: 'rgba(255, 236, 205, 0.9)', light: 'rgba(255, 246, 226, 0.95)' };

/** Water-lens ripples on the glass under the cursor (the reference footer's effect). */
function useWaterLens(glassRef, lensRef, theme) {
  const lens = useRef(/** @type {ReturnType<typeof mountWaterLens>} */ (null));
  const initialTheme = useRef(theme);

  useEffect(() => {
    const glass = glassRef.current;
    const canvas = lensRef.current;
    if (!glass || !canvas || prefersReducedMotion()) return undefined;
    try {
      lens.current = mountWaterLens(glass, canvas, initialTheme.current);
    } catch (error) {
      console.error('Footer water lens unavailable', error);
      lens.current = null;
    }
    return () => {
      lens.current?.destroy();
      lens.current = null;
    };
  }, [glassRef, lensRef]);

  useEffect(() => {
    lens.current?.setTheme(theme);
  }, [theme]);
}

/** Play the liquid-fill reveal the first time the glass scrolls into view. */
function useLiquidReveal(glassRef, theme) {
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const glass = glassRef.current;
    if (!glass) return undefined;
    if (prefersReducedMotion()) {
      glass.classList.add('is-settled');
      return undefined;
    }
    let cancel = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        glass.classList.add('is-opening');
        cancel = playLiquidReveal(glass, { crest: CREST[themeRef.current] });
      },
      { threshold: REVEAL_THRESHOLD },
    );
    observer.observe(glass);
    return () => {
      observer.disconnect();
      cancel();
    };
  }, [glassRef]);
}

const SOCIAL_ICONS = { github: 'github', linkedin: 'linkedin', fiverr: 'fiverr', instagram: 'instagram' };

/**
 * Liquid-glass footer that also hosts the contact form.
 * @param {{ theme: 'dark' | 'light', onToggleTheme: (origin?: { x: number, y: number }) => void }} props
 */
export function Footer({ theme, onToggleTheme }) {
  const glassRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const lensRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));
  const [isCopied, setIsCopied] = useState(false);
  useWaterLens(glassRef, lensRef, theme);
  useLiquidReveal(glassRef, theme);

  const year = new Date().getFullYear();
  const isDark = theme === 'dark';

  const handleAnchor = (event, href) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    scrollToId(href.slice(1));
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const handleThemeSwitch = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onToggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <footer id="contact" className="lfoot" aria-labelledby="contact-title">
      <div className="lfoot__scene">
        <div className="stage-slot lfoot__slot" data-stage-slot="contact" aria-hidden="true" />

        <div ref={glassRef} className="lfoot__glass">
          <div className="lfoot__surface" aria-hidden="true" />
          <canvas ref={lensRef} className="lfoot__lens" aria-hidden="true" />

          <div className="lfoot__details">
            <div className="lfoot__intro">
              <p className="lfoot__brand">
                <b aria-hidden="true">MA</b>
                {profile.name}
              </p>
              <h2 id="contact-title" className="lfoot__title">
                Have a project in mind?
                <em>Let&rsquo;s build it properly.</em>
              </h2>
              <ContactForm />
            </div>

            <nav className="lfoot__nav" aria-label="Footer">
              {footerColumns.map((column) => (
                <div key={column.title} className="lfoot__col">
                  <strong>{column.title}</strong>
                  {column.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(event) => handleAnchor(event, link.href)}
                      {...(link.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                      {link.isExternal && <span className="sr-only"> (opens in a new tab)</span>}
                    </a>
                  ))}
                </div>
              ))}
              <div className="lfoot__col lfoot__col--contact">
                <strong>Contact</strong>
                <span className="lfoot__email">
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  <button type="button" onClick={handleCopyEmail} aria-label="Copy email address">
                    <Icon name={isCopied ? 'check' : 'copy'} size={14} />
                  </button>
                </span>
                <a href={profile.phoneHref}>{profile.phone}</a>
                <span>{profile.location}</span>
                <span className="sr-only" aria-live="polite">
                  {isCopied ? 'Email address copied' : ''}
                </span>
              </div>
            </nav>

            <div className="lfoot__meta">
              <span className="lfoot__copy">
                &copy; {year} {profile.name}
                <i aria-hidden="true" />
                Available for new projects
              </span>
              <div className="lfoot__controls">
                <div className="lfoot__socials">
                  {socials.map((social) => (
                    <a key={social.id} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} (opens in a new tab)`}>
                      <Icon name={SOCIAL_ICONS[social.id]} size={17} />
                    </a>
                  ))}
                </div>
                <button type="button" className="lfoot__switch" role="switch" aria-checked={isDark} onClick={handleThemeSwitch}>
                  Dark mode
                  <span aria-hidden="true" />
                </button>
                <a className="lfoot__top" href="#top" onClick={(event) => handleAnchor(event, '#top')} aria-label="Back to top">
                  <Icon name="arrowUp" size={16} />
                </a>
              </div>
            </div>
          </div>

          <p className="lfoot__wordmark" aria-hidden="true">
            {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
