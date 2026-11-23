import { Icon } from '../ui/Icon';
import './visuals.css';

const PRODUCTS = [
  { name: 'Stoneware vase', price: '$48', tone: 'amber' },
  { name: 'Linen throw', price: '$64', tone: 'stone' },
  { name: 'Oak tray', price: '$36', tone: 'slate' },
  { name: 'Brass lamp', price: '$120', tone: 'ember' },
  { name: 'Glass carafe', price: '$29', tone: 'mist' },
  { name: 'Clay cup set', price: '$42', tone: 'sand' },
];

function BrowserBar({ url, children }) {
  return (
    <div className="mock__bar">
      <span className="mock__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="mock__url">{url}</span>
      {children}
    </div>
  );
}

function StoreVisual() {
  return (
    <div className="mock mock--store">
      <BrowserBar url="atelier-store.com/shop">
        <span className="mock__cart">
          Cart <b>3</b>
        </span>
      </BrowserBar>
      <div className="store">
        <div className="store__hero">
          <p className="store__kicker">New season</p>
          <p className="store__headline">Crafted goods, delivered.</p>
          <span className="store__cta">Shop the edit</span>
        </div>
        <ul className="store__grid">
          {PRODUCTS.map((product) => (
            <li key={product.name} className="store__item">
              <span className={`store__img store__img--${product.tone}`} />
              <span className="store__name">{product.name}</span>
              <span className="store__price">{product.price}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mock__toast">
        <Icon name="check" size={14} />
        Added to cart — checkout in 1 step
      </p>
    </div>
  );
}

const STEPS = ['Full backup', 'Database sync', 'DNS cut-over', 'SSL issued'];

function MigrationVisual() {
  return (
    <div className="mock mock--migration">
      <BrowserBar url="ops / migration-042">
        <span className="mock__live">Live</span>
      </BrowserBar>
      <div className="migrate">
        <div className="migrate__route">
          <div className="migrate__node">
            <span className="migrate__label">Old host</span>
            <span className="migrate__panel">cPanel</span>
            <span className="migrate__state">Draining</span>
          </div>
          <div className="migrate__wire" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="migrate__node migrate__node--new">
            <span className="migrate__label">New host</span>
            <span className="migrate__panel">hPanel</span>
            <span className="migrate__state">Serving</span>
          </div>
        </div>
        <ul className="migrate__steps">
          {STEPS.map((step) => (
            <li key={step}>
              <Icon name="check" size={13} />
              {step}
            </li>
          ))}
        </ul>
        <div className="migrate__uptime">
          <p>
            <b>100.00%</b> uptime during move
          </p>
          <span className="migrate__bars" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

const SCORES = [
  { label: 'Performance', value: 98 },
  { label: 'Accessibility', value: 100 },
  { label: 'Best practices', value: 100 },
  { label: 'SEO', value: 100 },
];
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 16;

function PortalVisual() {
  return (
    <div className="mock mock--portal">
      <BrowserBar url="northpoint-services.com" />
      <div className="portal">
        <div className="portal__site" aria-hidden="true">
          <span className="portal__nav" />
          <span className="portal__h1" />
          <span className="portal__h1 portal__h1--short" />
          <span className="portal__btn" />
        </div>
        <ul className="portal__scores">
          {SCORES.map((score) => (
            <li key={score.label}>
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="16" className="portal__track" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="portal__arc"
                  strokeDasharray={GAUGE_CIRCUMFERENCE}
                  strokeDashoffset={GAUGE_CIRCUMFERENCE * (1 - score.value / 100)}
                />
              </svg>
              <b>{score.value}</b>
              <span>{score.label}</span>
            </li>
          ))}
        </ul>
        <p className="portal__vitals">
          <span>LCP 1.1 s</span>
          <span>INP 90 ms</span>
          <span>CLS 0.01</span>
        </p>
      </div>
    </div>
  );
}

const VISUALS = { store: StoreVisual, migration: MigrationVisual, portal: PortalVisual };

/**
 * Crafted, decorative UI illustration for a case study.
 * @param {{ type: keyof typeof VISUALS }} props
 */
export function ProjectVisual({ type }) {
  const Visual = VISUALS[type];
  return Visual ? <Visual /> : null;
}
