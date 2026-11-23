import { projects, stats } from '../../data/content';
import { hasFinePointer, prefersReducedMotion } from '../../lib/environment';
import { Icon } from '../ui/Icon';
import { ProjectVisual } from './ProjectVisual';
import './work.css';

const MAX_TILT_DEG = 7;

/** Tilt the illustration toward the cursor (fine pointers, motion allowed). */
function handleTilt(event) {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty('--ry', `${x * MAX_TILT_DEG * 2}deg`);
  el.style.setProperty('--rx', `${-y * MAX_TILT_DEG * 2}deg`);
  el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
  el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
}

function resetTilt(event) {
  const el = event.currentTarget;
  el.style.setProperty('--ry', '0deg');
  el.style.setProperty('--rx', '0deg');
}

export function Work() {
  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="container">
        <header className="work__head">
          <div className="work__intro">
            <p className="eyebrow" data-reveal>
              Selected work
            </p>
            <h2 id="work-title" className="section-head__title" data-reveal>
              Built to load fast, <em>and stay online.</em>
            </h2>
            <p className="section-head__lead" data-reveal>
              Stores, business sites and migrations — the work I ship most, shown the way clients see it.
            </p>
          </div>
          <div className="stage-slot work__slot" data-stage-slot="work" aria-hidden="true" />
        </header>

        <div className="cases">
          {projects.map((project) => (
            <article key={project.id} className="case" aria-labelledby={`${project.id}-title`}>
              <div className="case__visual" onPointerMove={handleTilt} onPointerLeave={resetTilt} data-reveal>
                <div className="case__tilt">
                  <ProjectVisual type={project.visual} />
                  <span className="case__glare" aria-hidden="true" />
                </div>
              </div>

              <div className="case__info" data-reveal>
                <p className="case__meta">
                  <span className="case__index">{project.index}</span>
                  <span>{project.kind}</span>
                </p>
                <h3 id={`${project.id}-title`} className="case__title">
                  {project.title}
                </h3>
                <p className="case__summary">{project.summary}</p>
                <ul className="case__stack" aria-label="Technologies">
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="case__foot">
                  <p className="case__metric">
                    <b>{project.metric.value}</b>
                    {project.metric.label}
                  </p>
                  <a className="case__link" href={project.href} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                    <Icon name="arrowUpRight" size={18} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <dl className="results" data-reveal>
          {stats.map((stat) => (
            <div key={stat.label} className="results__item">
              <dt>{stat.label}</dt>
              <dd>
                <span data-count={stat.value}>{stat.value}</span>
                <span className="results__suffix">{stat.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
