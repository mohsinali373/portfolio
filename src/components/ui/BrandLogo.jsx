import wordpressLogo from '../../assets/wordpress.webp';
import cpanelLogo from '../../assets/cpanel.webp';
import hostingerLogo from '../../assets/hostinger.webp';
import { Icon } from './Icon';

const LOGOS = {
  wordpress: { src: wordpressLogo, alt: 'WordPress' },
  cpanel: { src: cpanelLogo, alt: 'cPanel' },
  hostinger: { src: hostingerLogo, alt: 'Hostinger' },
};

/**
 * Small square brand mark. Unknown names fall back to a code glyph.
 * @param {{ name: string, isDecorative?: boolean }} props
 */
export function BrandLogo({ name, isDecorative = true }) {
  const logo = LOGOS[name];
  return (
    <span className="brand-logo">
      {logo ? (
        <img src={logo.src} alt={isDecorative ? '' : logo.alt} width="28" height="28" loading="lazy" decoding="async" />
      ) : (
        <Icon name="code" size={20} />
      )}
    </span>
  );
}
