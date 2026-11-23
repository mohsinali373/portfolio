// Canvas-drawn faceplates that sit on the shaped forms so each section's object
// reads as something from the trade: a website on a screen, a code module, a
// server rack. Drawn once into CanvasTextures (cheap; no image downloads).
import * as THREE from 'three';

const INK = '#f2efe9';
const MUTED = 'rgba(242, 239, 233, 0.38)';
const FAINT = 'rgba(242, 239, 233, 0.12)';
const AMBER = '#d9a964';
const GREEN = '#7fb59a';
const PANEL = '#0c0c0f';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

/** A small storefront website, as seen on the screen panel. */
function drawSite() {
  const { canvas, ctx } = makeCanvas(1024, 640);
  if (!ctx) return canvas;
  ctx.fillStyle = PANEL;
  ctx.fillRect(0, 0, 1024, 640);

  // Browser chrome
  ctx.fillStyle = '#16161a';
  ctx.fillRect(0, 0, 1024, 56);
  ['#3a3a40', '#3a3a40', '#3a3a40'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(32 + i * 22, 28, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#0f0f12';
  roundRect(ctx, 120, 14, 520, 28, 14);
  ctx.fill();
  ctx.fillStyle = MUTED;
  ctx.font = '500 15px Outfit, system-ui, sans-serif';
  ctx.fillText('mohsinali.dev/shop', 140, 33);

  // Hero copy
  ctx.fillStyle = MUTED;
  ctx.font = '600 14px Outfit, system-ui, sans-serif';
  ctx.fillText('NEW SEASON', 64, 140);
  ctx.fillStyle = INK;
  ctx.font = '700 54px Outfit, system-ui, sans-serif';
  ctx.fillText('Crafted goods,', 60, 200);
  ctx.fillText('delivered.', 60, 258);
  ctx.fillStyle = FAINT;
  roundRect(ctx, 64, 290, 320, 12, 6);
  ctx.fill();
  roundRect(ctx, 64, 314, 250, 12, 6);
  ctx.fill();
  ctx.fillStyle = AMBER;
  roundRect(ctx, 64, 352, 170, 50, 25);
  ctx.fill();
  ctx.fillStyle = PANEL;
  ctx.font = '600 18px Outfit, system-ui, sans-serif';
  ctx.fillText('Shop now', 106, 384);

  // Product tiles
  const tones = [
    ['#e2b778', '#a8742f'],
    ['#cfc8bc', '#8d867a'],
    ['#8d99a8', '#4b5564'],
    ['#d98a5b', '#8e4527'],
  ];
  tones.forEach(([a, b], i) => {
    const x = 560 + (i % 2) * 210;
    const y = 100 + Math.floor(i / 2) * 250;
    ctx.fillStyle = '#17171b';
    roundRect(ctx, x, y, 190, 190, 18);
    ctx.fill();
    const grad = ctx.createLinearGradient(x + 60, y + 40, x + 130, y + 170);
    grad.addColorStop(0, a);
    grad.addColorStop(1, b);
    ctx.fillStyle = grad;
    roundRect(ctx, x + 62, y + 40, 66, 120, 30);
    ctx.fill();
    ctx.fillStyle = MUTED;
    roundRect(ctx, x, y + 202, 110, 10, 5);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = '600 16px Outfit, system-ui, sans-serif';
    ctx.fillText(`$${36 + i * 14}`, x + 140, y + 212);
  });
  return canvas;
}

/** A code module: the component/package view. */
function drawCode() {
  const { canvas, ctx } = makeCanvas(512, 512);
  if (!ctx) return canvas;
  ctx.fillStyle = PANEL;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = AMBER;
  ctx.font = '700 150px Outfit, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('</>', 256, 230);
  ctx.textAlign = 'left';
  const lines = [
    [AMBER, 70, 140],
    [MUTED, 100, 220],
    [MUTED, 100, 170],
    [GREEN, 130, 150],
    [MUTED, 100, 200],
    [AMBER, 70, 90],
  ];
  lines.forEach(([color, x, w], i) => {
    ctx.fillStyle = color;
    roundRect(ctx, x, 300 + i * 26, w, 10, 5);
    ctx.fill();
  });
  return canvas;
}

/** A server rack faceplate with status LEDs. */
function drawRack() {
  const { canvas, ctx } = makeCanvas(400, 820);
  if (!ctx) return canvas;
  ctx.fillStyle = PANEL;
  ctx.fillRect(0, 0, 400, 820);
  const units = 6;
  const unitH = 820 / units;
  for (let u = 0; u < units; u++) {
    const y = u * unitH;
    ctx.fillStyle = '#141418';
    roundRect(ctx, 18, y + 12, 364, unitH - 24, 10);
    ctx.fill();
    // grille
    ctx.fillStyle = FAINT;
    for (let g = 0; g < 7; g++) {
      roundRect(ctx, 40 + g * 22, y + 34, 8, unitH - 68, 4);
      ctx.fill();
    }
    // label + LEDs
    ctx.fillStyle = MUTED;
    roundRect(ctx, 220, y + 38, 110, 9, 4);
    ctx.fill();
    const leds = [GREEN, GREEN, u === 2 ? AMBER : GREEN];
    leds.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(232 + i * 26, y + unitH - 44, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
  return canvas;
}

const DRAWERS = { site: drawSite, code: drawCode, rack: drawRack };

/**
 * Build the faceplate textures. Waits for the Outfit font so canvas text matches the page.
 * @returns {Promise<Record<string, THREE.CanvasTexture>>}
 */
export async function buildFaceplates() {
  try {
    await document.fonts?.load('700 54px Outfit');
  } catch {
    // Canvas falls back to system-ui if the web font is unavailable.
  }
  const textures = {};
  for (const [name, draw] of Object.entries(DRAWERS)) {
    const texture = new THREE.CanvasTexture(draw());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures[name] = texture;
  }
  return textures;
}
