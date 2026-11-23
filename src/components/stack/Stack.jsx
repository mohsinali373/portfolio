import { useRef, useState } from 'react';
import { capabilityGroups } from '../../data/content';
import './stack.css';

export function Stack() {
  const [activeId, setActiveId] = useState(capabilityGroups[0].id);
  const tabRefs = useRef(/** @type {Record<string, HTMLButtonElement | null>} */ ({}));
  const active = capabilityGroups.find((group) => group.id === activeId) ?? capabilityGroups[0];

  // Roving focus per the WAI-ARIA tabs pattern.
  const handleKeyDown = (event, index) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let nextIndex = null;
    if (event.key in keys) nextIndex = (index + keys[event.key] + capabilityGroups.length) % capabilityGroups.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = capabilityGroups.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const next = capabilityGroups[nextIndex];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <section id="stack" className="section stack" aria-labelledby="stack-title">
      <div className="container">
        <header className="section-head section-head--split">
          <div>
            <p className="eyebrow" data-reveal>
              Capabilities
            </p>
            <h2 id="stack-title" className="section-head__title" data-reveal>
              One developer, <em>the whole stack.</em>
            </h2>
          </div>
          <p className="section-head__lead" data-reveal>
            From the markup a visitor sees to the PHP, database and Linux box behind it.
          </p>
        </header>

        <div className="stack__body">
          <div className="stack__tabs" role="tablist" aria-label="Capability areas" aria-orientation="vertical" data-reveal>
            {capabilityGroups.map((group, index) => {
              const isActive = group.id === active.id;
              return (
                <button
                  key={group.id}
                  ref={(el) => {
                    tabRefs.current[group.id] = el;
                  }}
                  id={`tab-${group.id}`}
                  type="button"
                  role="tab"
                  className={`stack__tab${isActive ? ' is-active' : ''}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${group.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveId(group.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <span className="stack__tab-index">0{index + 1}</span>
                  <span className="stack__tab-label">{group.title}</span>
                  <span className="stack__tab-count">{group.items.length}</span>
                </button>
              );
            })}
          </div>

          <div
            key={active.id}
            id={`panel-${active.id}`}
            className="stack__panel"
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
            tabIndex={0}
          >
            <p className="stack__blurb">{active.blurb}</p>
            <ul className="stack__items">
              {active.items.map((item, index) => (
                <li key={item} style={{ '--i': index }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="stage-slot stack__slot" data-stage-slot="stack" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
