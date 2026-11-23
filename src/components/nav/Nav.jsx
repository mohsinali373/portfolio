import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { navLinks, profile } from '../../data/content';
import { scrollToId, setScrollLocked } from '../../lib/smoothScroll';
import { Icon } from '../ui/Icon';
import './nav.css';

/**
 * @param {{ theme: 'dark' | 'light', onToggleTheme: (origin?: { x: number, y: number }) => void, activeId: string }} props
 */
export function Nav({ theme, onToggleTheme, activeId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoverId, setHoverId] = useState(/** @type {string | null} */ (null));
  const [pill, setPill] = useState({ x: 0, width: 0, isVisible: false });
  const listRef = useRef(/** @type {HTMLUListElement | null} */ (null));
  const menuRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const menuButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));

  const indicatorId = hoverId ?? activeId;

  // Morphing pill: slide behind the hovered link, or the active section's link.
  useLayoutEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector(`[data-nav="${indicatorId}"]`);
    if (!list || !link) {
      setPill((p) => ({ ...p, isVisible: false }));
      return;
    }
    const listRect = list.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    setPill({ x: rect.left - listRect.left, width: rect.width, isVisible: true });
  }, [indicatorId]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    setScrollLocked(isMenuOpen);
    if (!isMenuOpen) return undefined;
    menuRef.current?.querySelector('a, button')?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  const handleNavigate = (event, id) => {
    event.preventDefault();
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setScrollLocked(false);
    }
    scrollToId(id);
  };

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="nav">
      <nav className="nav__bar glass" aria-label="Main navigation">
        <a className="nav__brand" href="#top" onClick={(e) => handleNavigate(e, 'top')} aria-label={`${profile.name} — back to top`}>
          <span className="nav__mark">MA</span>
          <span className="nav__name">{profile.name}</span>
        </a>

        <ul className="nav__links" ref={listRef} onPointerLeave={() => setHoverId(null)}>
          <span
            className="nav__pill"
            aria-hidden="true"
            style={{ transform: `translateX(${pill.x}px)`, width: pill.width, opacity: pill.isVisible ? 1 : 0 }}
          />
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                data-nav={link.id}
                className={activeId === link.id ? 'is-active' : undefined}
                aria-current={activeId === link.id ? 'location' : undefined}
                onPointerEnter={() => setHoverId(link.id)}
                onFocus={() => setHoverId(link.id)}
                onBlur={() => setHoverId(null)}
                onClick={(e) => handleNavigate(e, link.id)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav__actions">
          <button
            type="button"
            className="nav__icon-btn"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              onToggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          <a className="nav__cta" href="#contact" onClick={(e) => handleNavigate(e, 'contact')}>
            Let&rsquo;s talk
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="nav__icon-btn nav__menu-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`nav__sheet${isMenuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!isMenuOpen}
      >
        <button type="button" className="nav__icon-btn nav__sheet-close" onClick={closeMenu} aria-label="Close menu">
          <Icon name="close" size={22} />
        </button>
        <ol className="nav__sheet-links">
          {navLinks.map((link, index) => (
            <li key={link.id} style={{ '--i': index }}>
              <a href={`#${link.id}`} onClick={(e) => handleNavigate(e, link.id)}>
                <span className="nav__sheet-index">0{index + 1}</span>
                {link.label}
              </a>
            </li>
          ))}
        </ol>
        <p className="nav__sheet-foot">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
      </div>
    </header>
  );
}
