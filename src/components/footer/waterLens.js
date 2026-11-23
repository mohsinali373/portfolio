// Water-lens ripples for the liquid-glass footer, ported from the reference
// footer (D:\Projects\Footer\water.js). Each pointer movement drops an expanding
// ring; the fragment shader bends a backdrop painted in the glass's own colours
// and lights the ripple slopes, so the glass reads as liquid under the cursor.
// Renders only while ripples are alive — zero cost at rest.

// Tuned for a calm wake: many small, slow, long-lived rings dropped along the
// cursor path overlap into the V-shaped trail an object leaves when drawn through water.
const MAX_WAVES = 48;
const WAVE_LIFETIME_MS = 1600;
const MIN_INTERVAL_MS = 32;
const MIN_STEP = 0.006; // share of glass width between drops
const DROP_SPACING = 0.025; // share of glass width between interpolated drops
const SPEED_TO_FORCE = 0.5; // px/ms → wave strength
const MIN_FORCE = 0.18;
const MAX_FORCE = 0.55;
const TAP_FORCE = 0.9;

const vertexSource = `#version 300 es
in vec2 point;
void main() { gl_Position = vec4(point, 0., 1.); }
`;

const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D backdrop;
uniform vec2 size;
uniform vec4 waves[${MAX_WAVES}];
uniform float dark;
out vec4 color;

vec3 sampleBackdrop(vec2 point) {
  return texture(backdrop, clamp(point / size, 0., 1.)).rgb;
}

void main() {
  vec2 point = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 distortion = vec2(0.);
  float slope = 0.;
  float energy = 0.;
  float unit = size.x / 1200.;
  for (int i = 0; i < ${MAX_WAVES}; i++) {
    vec4 wave = waves[i];
    if (wave.w <= 0.) continue;
    vec2 offset = point - wave.xy;
    float distance = length(offset);
    float width = unit * (16. + wave.z * 22.);
    float phase = (distance - unit * (5. + wave.z * 170.)) / width;
    float envelope = exp(-phase * phase * .37)
      * smoothstep(0., .06, wave.z)
      * (1. - smoothstep(.35, 1.5, wave.z))
      * smoothstep(1., 14. * unit, distance);
    float gradient = sin(phase * 3.3) * envelope * wave.w;
    distortion += offset / max(distance, 1.) * gradient * 15. * unit;
    slope += gradient * dot(offset / max(distance, 1.), vec2(-.58, -.65));
    energy += envelope * wave.w;
  }
  if (energy < .015) { color = vec4(0.); return; }
  vec3 bent = sampleBackdrop(point + distortion);
  vec3 straight = sampleBackdrop(point);
  vec3 glass = mix(straight, bent, .93);
  glass = mix(glass * .83 + vec3(.13, .095, .065), glass * .55 + vec3(.06, .05, .04), dark);
  glass += clamp(slope, -.45, .5) * vec3(.24, .22, .19);
  color = vec4(glass, clamp(energy * .42, 0., .55));
}
`;

const BACKDROPS = {
  dark: { stops: ['#2c231c', '#0e0e12', '#3a2a18'], glow: 'rgba(201, 163, 107, 0.38)' },
  light: { stops: ['#fff8ee', '#f1ece4', '#e2caa8'], glow: 'rgba(140, 93, 31, 0.2)' },
};

/** Paint a soft backdrop that matches the frosted glass, for the ripples to refract. */
function paintBackdrop(theme, aspect) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = Math.max(1, Math.round(720 * aspect));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const { stops, glow } = BACKDROPS[theme];
  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, stops[0]);
  base.addColorStop(0.54, stops[1]);
  base.addColorStop(1, stops[2]);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const halo = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.35, 0, canvas.width / 2, canvas.height * 0.35, canvas.width * 0.42);
  halo.addColorStop(0, glow);
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Water lens: could not create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader error');
  return shader;
}

/**
 * @param {HTMLElement} glass  surface that receives pointer events
 * @param {HTMLCanvasElement} canvas  overlay canvas inside the glass
 * @param {'dark' | 'light'} initialTheme
 * @returns {{ setTheme: (theme: 'dark' | 'light') => void, destroy: () => void } | null}
 */
export function mountWaterLens(glass, canvas, initialTheme) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
  if (!gl) return null;

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link error');
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const point = gl.getAttribLocation(program, 'point');
  gl.enableVertexAttribArray(point);
  gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);
  const uSize = gl.getUniformLocation(program, 'size');
  const uWaves = gl.getUniformLocation(program, 'waves[0]');
  const uDark = gl.getUniformLocation(program, 'dark');

  const texture = gl.createTexture();
  let theme = initialTheme;
  const uploadBackdrop = () => {
    const rect = glass.getBoundingClientRect();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paintBackdrop(theme, rect.height / Math.max(rect.width, 1)));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  uploadBackdrop();

  const waves = [];
  const values = new Float32Array(MAX_WAVES * 4);
  let lastPoint = null;
  let frame = 0;

  const render = (now) => {
    frame = 0;
    while (waves.length && now - waves[0].time >= WAVE_LIFETIME_MS) waves.shift();
    if (!waves.length) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    const bounds = glass.getBoundingClientRect();
    const resolution = Math.min(window.devicePixelRatio, 1.25);
    const width = Math.round(bounds.width * resolution);
    const height = Math.round(bounds.height * resolution);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    values.fill(0);
    waves.forEach((wave, i) => values.set([wave.x * width, wave.y * height, (now - wave.time) / 1000, wave.force], i * 4));
    gl.uniform2f(uSize, width, height);
    gl.uniform4fv(uWaves, values);
    gl.uniform1f(uDark, theme === 'dark' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frame = requestAnimationFrame(render);
  };

  const disturb = (event, isImpact) => {
    if (event.pointerType === 'touch' && !isImpact) return;
    const bounds = glass.getBoundingClientRect();
    const now = performance.now();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const distance = lastPoint ? Math.hypot((x - lastPoint.x) * bounds.width, (y - lastPoint.y) * bounds.height) : 0;
    const elapsed = lastPoint ? now - lastPoint.time : 0;
    if (!isImpact && lastPoint && (distance < bounds.width * MIN_STEP || elapsed < MIN_INTERVAL_MS)) return;

    if (isImpact || !lastPoint) {
      waves.push({ x, y, time: now, force: isImpact ? TAP_FORCE : MIN_FORCE });
    } else {
      // Faster strokes push more water; drops along the stroke are born at
      // staggered times (older behind the cursor), so the rings form a wake.
      const speed = distance / Math.max(elapsed, 1);
      const force = Math.min(Math.max(speed * SPEED_TO_FORCE, MIN_FORCE), MAX_FORCE);
      const count = Math.min(6, Math.max(1, Math.ceil(distance / (bounds.width * DROP_SPACING))));
      for (let step = 1; step <= count; step++) {
        const fraction = step / count;
        waves.push({
          x: lastPoint.x + (x - lastPoint.x) * fraction,
          y: lastPoint.y + (y - lastPoint.y) * fraction,
          time: now - (1 - fraction) * elapsed,
          force,
        });
      }
    }
    if (waves.length > MAX_WAVES) waves.splice(0, waves.length - MAX_WAVES);
    lastPoint = { x, y, time: now };
    if (!frame) frame = requestAnimationFrame(render);
  };

  const handleMove = (event) => disturb(event, false);
  const handleDown = (event) => disturb(event, true);
  const handleLeave = () => {
    lastPoint = null;
  };
  glass.addEventListener('pointermove', handleMove, { passive: true });
  glass.addEventListener('pointerdown', handleDown, { passive: true });
  glass.addEventListener('pointerleave', handleLeave);
  window.addEventListener('resize', uploadBackdrop);

  return {
    setTheme(next) {
      theme = next;
      uploadBackdrop();
    },
    destroy() {
      cancelAnimationFrame(frame);
      glass.removeEventListener('pointermove', handleMove);
      glass.removeEventListener('pointerdown', handleDown);
      glass.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('resize', uploadBackdrop);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
