import { Environment, Lightformer } from '@react-three/drei';

const STUDIO = {
  dark: { world: '#0b0b0d', key: '#e3b97c', keyI: 3.2, rim: '#9ba7b8', rimI: 1.5, top: '#ffffff', topI: 1.7, fill: '#8a7d6c', fillI: 0.45 },
  // Light page, dark studio: chrome reflecting a bright world reads as a flat grey
  // blob on off-white, so the light theme keeps a dark set and brighter cards.
  light: { world: '#2a2825', key: '#dca45a', keyI: 3.4, rim: '#8191a6', rimI: 1.6, top: '#ffffff', topI: 2.4, fill: '#a09482', fillI: 0.55 },
};

/**
 * A procedural studio environment built from light cards — no HDR download.
 * Warm amber key, cool slate rim, white softbox strip. Rendered once (frames=1)
 * and rebuilt only when the theme changes.
 * @param {{ theme: 'dark' | 'light' }} props
 */
export function StudioLights({ theme }) {
  const s = STUDIO[theme];
  return (
    <Environment key={theme} resolution={256} frames={1}>
      <color attach="background" args={[s.world]} />
      <Lightformer form="rect" color={s.key} intensity={s.keyI} position={[-4.5, 1.2, 2.5]} scale={[2.6, 7, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" color={s.rim} intensity={s.rimI} position={[4.8, -0.5, -1.5]} scale={[2, 6, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" color={s.top} intensity={s.topI} position={[0, 5, 0]} scale={[12, 0.5, 1]} target={[0, 0, 0]} />
      <Lightformer form="ring" color={s.key} intensity={s.keyI * 0.35} position={[2, -3, 4]} scale={2.2} target={[0, 0, 0]} />
      {/* Soft frontal fill: flat faces that look at the camera read as polished metal, not a black hole. */}
      <Lightformer form="rect" color={s.fill} intensity={s.fillI} position={[0, 0.5, 7]} scale={[9, 5, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}
