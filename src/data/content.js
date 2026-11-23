// Single source of truth for all portfolio copy.
// Facts are taken from Mohsin_Ali_CV.pdf and the previous site's content.

export const profile = {
  name: 'Mohsin Ali',
  firstName: 'Mohsin',
  lastName: 'Ali',
  role: 'Full-Stack Web Developer',
  focus: 'WordPress · React · PHP · Servers',
  location: 'Multan Cantt, Pakistan',
  city: 'Multan, PK',
  phone: '+92 309 7847427',
  phoneHref: 'tel:+923097847427',
  email: 'mohsinali.seo123@gmail.com',
  resumeUrl: 'Mohsin_Ali_CV.pdf',
  github: 'https://github.com/mohsinali373',
  summary:
    'Website developer with 4 years of practical experience building, customising and maintaining websites with WordPress, React and PHP — plus hands-on server handling and team management, with a practical approach to solving website, hosting and workflow issues.',
};

export const socials = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/mohsinali373' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohsin-ali-93644a297' },
  { id: 'fiverr', label: 'Fiverr', href: 'https://www.fiverr.com/mohsinali3732' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/black_devil_official373/' },
];

export const navLinks = [
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'process', label: 'Process' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const hero = {
  lead: 'I design, build and keep alive fast WordPress, React and PHP websites — from the first layout to the server it runs on.',
  core: ['React', 'HTML5', 'CSS3', 'JavaScript', 'PHP', 'WordPress'],
};

export const stats = [
  { value: 50, suffix: '+', label: 'Server migrations' },
  { value: 30, suffix: '+', label: 'Business sites' },
  { value: 20, suffix: '+', label: 'Blogs & portfolios' },
  { value: 15, suffix: '+', label: 'WooCommerce stores' },
];

/** `visual` picks the crafted UI illustration rendered for each case study. */
export const projects = [
  {
    id: 'ecommerce-shop',
    index: '01',
    title: 'WooCommerce E-Shop',
    kind: 'E-commerce build',
    summary:
      'A complete store with custom product layouts, cart and checkout flows, payment processing and an admin dashboard — built on WordPress and tuned to convert.',
    stack: ['WordPress', 'WooCommerce', 'Elementor Pro', 'PHP', 'MySQL'],
    metric: { value: '15+', label: 'stores shipped' },
    visual: 'store',
    href: 'https://github.com/mohsinali373?tab=repositories',
  },
  {
    id: 'server-migration',
    index: '02',
    title: 'Zero-Downtime Migration',
    kind: 'Server & hosting',
    summary:
      'Moved large corporate portals between hosting panels without a second of downtime — automated cloud backups, SSL and complex DNS mapping included.',
    stack: ['cPanel', 'hPanel', 'DNS', 'SSL / TLS', 'Linux'],
    metric: { value: '50+', label: 'migrations, 0 downtime' },
    visual: 'migration',
    href: 'https://github.com/mohsinali373?tab=repositories',
  },
  {
    id: 'business-site',
    index: '03',
    title: 'Corporate Business Portal',
    kind: 'Business website',
    summary:
      'A fast, high-converting site for a local service business — technical SEO, Core Web Vitals tuning and lead forms with autoresponders.',
    stack: ['WordPress', 'Technical SEO', 'Core Web Vitals', 'JavaScript', 'CF7'],
    metric: { value: '98', label: 'Lighthouse performance' },
    visual: 'portal',
    href: 'https://github.com/mohsinali373?tab=repositories',
  },
];

export const capabilityGroups = [
  {
    id: 'frontend',
    title: 'Front-end',
    blurb: 'Responsive, accessible interfaces with motion that earns its place.',
    items: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'GSAP', 'Three.js', 'Vite'],
  },
  {
    id: 'backend',
    title: 'CMS & Back-end',
    blurb: 'WordPress done properly — themes, plugins, stores and custom PHP.',
    items: ['PHP', 'MySQL', 'WordPress', 'WooCommerce', 'Elementor Pro', 'Divi', 'Contact Form 7', 'EmailJS'],
  },
  {
    id: 'performance',
    title: 'SEO & Speed',
    blurb: 'Sites that load fast, index cleanly and pass Core Web Vitals.',
    items: ['Technical SEO', 'Core Web Vitals', 'WP Rocket', 'Perfmatters', 'Asset CleanUp', 'Cloudflare CDN', 'Image optimisation', 'Query tuning'],
  },
  {
    id: 'server',
    title: 'Server & Hosting',
    blurb: 'The unglamorous layer that keeps everything online.',
    items: ['Linux', 'VPS', 'SSH', 'Firewalls', 'Cron jobs', 'cPanel', 'hPanel', 'Plesk', 'DNS', 'SSL / TLS', 'Backups', 'Git & GitHub'],
  },
];

export const process = [
  { index: '01', title: 'Analyze', text: 'Goals, audience and content structure — then the leanest theme and plugin stack for the job.' },
  { index: '02', title: 'Develop', text: 'Responsive layouts, WooCommerce stores and custom components, built for every screen.' },
  { index: '03', title: 'Configure', text: 'Domains, cPanel / hPanel, SSL, automated backups and server fixes before users ever notice.' },
  { index: '04', title: 'Deliver', text: 'Responsive QA, speed and SEO checks, then a calm launch — with support after go-live.' },
];

/** `years` drives the bar length in the experience chart (max 4). */
export const experience = [
  { role: 'Website Developer', org: 'Freelance — WordPress, React, PHP', years: 4, label: '4 yrs' },
  { role: 'Web Hosting Administrator', org: 'Hosting management', years: 3, label: '3 yrs' },
  { role: 'Linux Server Administrator', org: 'Server administration', years: 2, label: '2 yrs' },
  { role: 'Speed Optimization Specialist', org: 'WordPress performance', years: 2, label: '2 yrs' },
  { role: 'Team Coordinator', org: 'Task, QA & workflow lead', years: 2, label: '2 yrs' },
];

export const facts = [
  { label: 'Based in', value: 'Multan Cantt, PK' },
  { label: 'Experience', value: '4 years' },
  { label: 'Languages', value: 'Urdu · English' },
  { label: 'Working', value: 'Remote, worldwide' },
];

export const certifications = [
  { name: 'Website Development', issuer: 'Online Academy', logo: 'web' },
  { name: 'Hostinger Hosting', issuer: 'Hostinger Academy', logo: 'hostinger' },
  { name: 'Hosting & Server Admin', issuer: 'Plesk / cPanel', logo: 'cpanel' },
];

export const footerColumns = [
  {
    title: 'Navigate',
    links: [
      { label: 'Work', href: '#work' },
      { label: 'Stack', href: '#stack' },
      { label: 'Process', href: '#process' },
      { label: 'About', href: '#about' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Website development', href: '#work' },
      { label: 'WooCommerce stores', href: '#work' },
      { label: 'Speed & SEO', href: '#stack' },
      { label: 'Hosting & DNS', href: '#stack' },
    ],
  },
  {
    title: 'Connect',
    links: socials.map((s) => ({ label: s.label, href: s.href, isExternal: true })),
  },
];

export const emailjsConfig = {
  // EmailJS public identifiers (safe to ship client-side by design).
  serviceId: 'service_gl8uc2g',
  templateId: 'template_ie2x91r',
  publicKey: 'Eq9NQYgIUuXO9W4X3',
};
