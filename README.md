# Mohsin Ali — Portfolio

Personal portfolio of **Mohsin Ali** — website developer (WordPress · React · PHP) and server administrator from Multan, Pakistan.

**Live:** [portfolio-ashen-beta-uhtz25qqi8.vercel.app](https://portfolio-ashen-beta-uhtz25qqi8.vercel.app/)

## Highlights

- **A 3D form that follows the scroll.** One liquid-metal object travels down the page and docks into a reserved spot in every section, morphing into something from the trade:
  liquid drop (hero) → screen showing a storefront (work) → `</>` code module (stack) → server rack with status LEDs (process) → orbiting core (about) → liquid pool under the footer glass.
  Its position is a pure function of scroll — it moves as you scroll and stops when you stop.
- **Crafted case studies** — a WooCommerce store, a zero-downtime server migration dashboard and a Lighthouse-scored business site, each drawn as an interactive UI that tilts toward the cursor.
- **Liquid-glass footer** — frosted glass that fills in with a wavy liquid edge, a water-lens shader that leaves a calm wake under the cursor, the contact form, links and a giant metallic wordmark.
- **Dark (default) and light themes**, switched with a circular reveal and remembered between visits.
- **Custom cursor**, inertial smooth scrolling, staggered reveals — all disabled or simplified for `prefers-reduced-motion`.
- Fully responsive (checked at 320, 360, 390, 414 and 1440 px — no horizontal scroll or overlapping text).

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 19, Vite, HTML5, CSS3 (design tokens, container queries), Outfit typeface |
| 3D | Three.js, React Three Fiber, drei, custom GLSL (superellipsoid morph, simplex-noise liquid surface) |
| Effects | WebGL2 water-lens shader, canvas-drawn faceplates, View Transitions |
| Motion | GSAP (ScrollTrigger, SplitText), Lenis |
| Contact | EmailJS (lazy-loaded) |

The site also presents PHP, MySQL, WordPress, WooCommerce, Elementor, technical SEO, Core Web Vitals, Linux/VPS, cPanel/hPanel/Plesk, DNS and SSL work.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Editing content

All copy lives in **`src/data/content.js`** — profile, projects, capabilities, process, experience, certifications, footer links and the EmailJS IDs. The CV is `public/Mohsin_Ali_CV.pdf`.

## Project layout

```
src/
  data/content.js        all site copy
  components/
    stage/               WebGL stage: LiquidCore (scroll docking), liquid shader,
                         per-section shapes (keyframes.js), faceplates, studio lights
    hero/ work/ stack/ process/ about/ footer/ nav/ ui/
  lib/                   smooth scroll, reveals, theme, device checks, shared motion state
  styles/                tokens.css (dark + light themes), base.css
public/                  favicon, CV
```

**How the 3D docking works:** every section contains an empty `[data-stage-slot]` box. Each frame the form measures where those boxes are on screen, finds the two it sits between, and interpolates position, size and shape by scroll progress — so it lands correctly at any screen size.

## Deploy

The site is hosted on **Vercel** (free Hobby plan), connected to this GitHub repository:

- Every push or merged pull request on **`main`** rebuilds and updates the live site automatically.
- Every other branch gets its own **preview URL**, so changes can be checked before merging.
- Vercel detects Vite: build command `npm run build`, output directory `dist`.

A GitHub Pages workflow (`.github/workflows/deploy.yml`) is also included as an alternative host; it only publishes once **Settings → Pages → Source: GitHub Actions** is enabled.

## Performance & accessibility

- The WebGL stage loads lazily in its own chunk; pixel ratio is capped (2 on desktop, 1.5 on phones) and drops automatically if frames fall; phones get fewer vertices.
- The footer water shader only renders while ripples are alive.
- Keyboard-navigable tabs and menu, visible focus, skip link, labelled form fields with inline errors, honeypot spam guard.

## Contact

- Email: [mohsinali.seo123@gmail.com](mailto:mohsinali.seo123@gmail.com)
- GitHub: [github.com/mohsinali373](https://github.com/mohsinali373)
- LinkedIn: [linkedin.com/in/mohsin-ali-93644a297](https://www.linkedin.com/in/mohsin-ali-93644a297)
- Fiverr: [fiverr.com/mohsinali3732](https://www.fiverr.com/mohsinali3732)
