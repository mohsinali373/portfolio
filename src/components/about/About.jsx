import portraitColor from '../../assets/mohsin-ali.webp';
import portraitMono from '../../assets/mohsin-ali-mono.webp';
import { certifications, experience, facts, profile } from '../../data/content';
import { BrandLogo } from '../ui/BrandLogo';
import './about.css';

const MAX_YEARS = 4;

export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__grid">
          <figure className="about__portrait" data-reveal>
            <img className="about__img about__img--mono" src={portraitMono} alt={`Portrait illustration of ${profile.name}`} width="1400" height="788" loading="lazy" decoding="async" />
            <img className="about__img about__img--color" src={portraitColor} alt="" width="1400" height="788" loading="lazy" decoding="async" />
          </figure>

          <div className="about__body">
            <p className="eyebrow" data-reveal>
              About
            </p>
            <h2 id="about-title" className="section-head__title" data-reveal>
              Practical by nature, <em>precise by habit.</em>
            </h2>
            <p className="about__lead" data-reveal>
              I&rsquo;m {profile.name}, a developer from Multan, Pakistan. For four years I&rsquo;ve built fast,
              responsive websites — and kept the servers behind them healthy.
            </p>
            <p className="about__text" data-reveal>
              {profile.summary}
            </p>
            <dl className="about__facts" data-reveal>
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="exp">
          <div className="exp__intro">
            <h3 className="exp__title" data-reveal>
              Years in the craft
            </h3>
            <div className="stage-slot exp__slot" data-stage-slot="about" aria-hidden="true" />
          </div>

          <ol className="exp__chart" aria-label="Experience by discipline, in years">
            {experience.map((item) => (
              <li key={item.role} className="exp__row" data-reveal>
                <div className="exp__label">
                  <span className="exp__role">{item.role}</span>
                  <span className="exp__org">{item.org}</span>
                </div>
                <span className="exp__track" aria-hidden="true">
                  <span className="exp__bar" style={{ '--share': item.years / MAX_YEARS }} />
                </span>
                <span className="exp__years">{item.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <ul className="certs" aria-label="Certifications" data-reveal>
          {certifications.map((cert) => (
            <li key={cert.name} className="certs__item">
              <BrandLogo name={cert.logo} />
              <span>
                <span className="certs__name">{cert.name}</span>
                <span className="certs__issuer">{cert.issuer}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
