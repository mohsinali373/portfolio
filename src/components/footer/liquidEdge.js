// "Liquid fill" reveal for the footer glass: the panel rises from the bottom
// behind a wavy, glowing crest (clip-path polygon + a 2D canvas stroke).
// Adapted from the reference footer's opening animation.

const DURATION = 1.06;
// [time (s), crest height as a share of the panel, 1 = bottom edge]
const LEVELS = [
  [0.08, 1.02],
  [0.2, 0.82],
  [0.35, 0.51],
  [0.51, 0.28],
  [0.66, 0.13],
  [0.81, 0.015],
  [1.06, 0],
];
const SAMPLES = 96;

/**
 * @param {HTMLElement} glass
 * @param {{ crest: string }} colors
 * @returns {() => void} cancel
 */
export function playLiquidReveal(glass, colors) {
  const canvas = document.createElement('canvas');
  canvas.className = 'lfoot__edge';
  canvas.setAttribute('aria-hidden', 'true');
  glass.append(canvas);
  const context = canvas.getContext('2d');
  if (!context) {
    canvas.remove();
    glass.classList.add('is-settled');
    return () => {};
  }

  const start = performance.now();
  let frame = 0;

  const finish = () => {
    glass.style.removeProperty('clip-path');
    glass.classList.add('is-settled');
    canvas.remove();
  };

  const draw = (time) => {
    const elapsed = (time - start) / 1000;
    if (elapsed >= DURATION) {
      finish();
      return;
    }
    const { width, height } = glass.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio, 2);
    const pixelW = Math.round(width * ratio);
    const pixelH = Math.round(height * ratio);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const next = Math.max(1, LEVELS.findIndex(([t]) => t >= elapsed));
    const [fromTime, fromLevel] = LEVELS[next - 1];
    const [toTime, toLevel] = LEVELS[next];
    const progress = Math.max(0, (elapsed - fromTime) / (toTime - fromTime));
    const crest = height * (fromLevel + (toLevel - fromLevel) * progress);
    const fade = Math.min(1, elapsed / 0.18) * Math.min(1, (DURATION - elapsed) / 0.32);
    const amplitude = height * 0.031 * fade;

    const points = [];
    context.beginPath();
    for (let step = 0; step <= SAMPLES; step++) {
      const fraction = step / SAMPLES;
      const x = width * fraction;
      const y = Math.max(0, crest + amplitude * (Math.sin(fraction * 18 - elapsed * 3) + 0.36 * Math.cos(fraction * 41 + elapsed * 7)));
      points.push(`${x}px ${y}px`);
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    glass.style.clipPath = `polygon(${points.join(',')},100% 100%,0 100%)`;
    context.shadowColor = colors.crest;
    context.shadowBlur = width * 0.012;
    context.lineWidth = Math.max(1.4, width * 0.004);
    context.strokeStyle = colors.crest;
    context.globalAlpha = 0.9 * fade;
    context.stroke();
    frame = requestAnimationFrame(draw);
  };

  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    finish();
  };
}
