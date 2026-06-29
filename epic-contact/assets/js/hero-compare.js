/*
 * Hero visuals, both reusing the dataset demo's renderers from app.js:
 *   1. a before/after slider that overlays the LIVE 3D mesh projection on the frame
 *      (parseOBJ + drawCameraSpaceMesh), and
 *   2. an auto-rotating 3D geometry viewer of the same mesh (renderOBJCanvas).
 *
 * The import URL MUST match the app.js <script> tag's URL/version so the module
 * loads a single time and the demo is not initialised twice.
 */
import {
  parseOBJ,
  drawCameraSpaceMesh,
  renderOBJCanvas,
  normalizeVertices,
  meshPalette,
  buildVertexColorPalette,
} from './app.js?v=22';

// Mirrors the demo's fixed projection camera (app.js visualState defaults).
const HERO_CAMERA = { focalLength: 5000, centerOffsetX: 0, centerOffsetY: 0 };
const MESH_PATH = 'dataset/P01_01_17259_17658_left_pan/hoi_mesh.obj';

function waitForImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve(img);
  return new Promise((resolve, reject) => {
    img.addEventListener('load', () => resolve(img), { once: true });
    img.addEventListener('error', () => reject(new Error('hero frame failed to load')), { once: true });
  });
}

const REST_REVEAL = 50; // divider settles in the middle

// Apply the reveal position. We set the clip-path directly (with the -webkit-
// prefix) rather than relying on a CSS custom property inside clip-path, because
// Safari does not reliably repaint clip-path when the variable changes.
function setReveal(container, range, value) {
  const v = Math.min(100, Math.max(0, value));
  container.style.setProperty('--reveal', `${v}%`);
  const reveal = container.querySelector('.img-compare__reveal');
  if (reveal) {
    const clip = `inset(0 0 0 ${v}%)`;
    reveal.style.webkitClipPath = clip;
    reveal.style.clipPath = clip;
  }
  if (range) range.value = Math.round(v);
}

function wireSlider(container) {
  const range = container.querySelector('.img-compare__range');
  if (!range) return range;
  range.addEventListener('input', () => setReveal(container, range, Number(range.value)));
  setReveal(container, range, Number(range.value));
  return range;
}

// One-time attention nudge: sweep the divider left, then right, then settle middle.
function playIntro(container, range) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setReveal(container, range, REST_REVEAL);
    return;
  }
  const stops = [
    { at: 0, v: REST_REVEAL },
    { at: 650, v: 14 },
    { at: 1500, v: 86 },
    { at: 2250, v: REST_REVEAL },
  ];
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const start = performance.now();
  function frame(now) {
    const t = now - start;
    let i = 0;
    while (i < stops.length - 1 && t > stops[i + 1].at) i++;
    if (i >= stops.length - 1) { setReveal(container, range, REST_REVEAL); return; }
    const a = stops[i], b = stops[i + 1];
    const p = ease(Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at))));
    setReveal(container, range, a.v + (b.v - a.v) * p);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Run `cb` once, the first time `el` is ~40% within the viewport.
// We use getBoundingClientRect on scroll rather than IntersectionObserver:
// Safari fires IO's initial callback as "visible" for below-the-fold elements
// right after load, which would trigger the nudge before the user scrolls to it.
function whenInView(el, cb) {
  let done = false;
  function check() {
    if (done) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (!r.height || !vh) return;
    const visible = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top));
    if (visible / Math.min(r.height, vh) >= 0.4) {
      done = true;
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      cb();
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
}

async function renderSlider(container, range, mesh) {
  const base = container.querySelector('.img-compare__base');
  const canvas = container.querySelector('.img-compare__canvas');
  if (!base || !canvas) return;
  try {
    const img = await waitForImage(base);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    canvas.style.aspectRatio = `${width} / ${height}`;
    drawCameraSpaceMesh(canvas, mesh, 'hand_object', width, height, HERO_CAMERA);
    // Nudge to draw attention - but only once the slider is scrolled into view.
    whenInView(container, () => playIntro(container, range));
  } catch (err) {
    console.error('hero-compare:', err);
  }
}

// Auto-rotating 3D geometry viewer - reuses the demo's OBJ renderer (renderOBJCanvas),
// spinning slowly about the vertical axis. Only renders while on screen.
function startMeshSpin(panel, mesh) {
  const canvas = panel.querySelector('.hero-mesh__canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const vertices = normalizeVertices(mesh.vertices);
  const palette = meshPalette('hand_object');
  const vcp = buildVertexColorPalette(mesh.vertexColors, palette);
  const state = { rotX: -0.35, rotY: 0.6, zoom: 1.0 };
  const draw = () => renderOBJCanvas(canvas, ctx, vertices, mesh.faces, mesh.groups, mesh.vertexColors, palette, vcp, state);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(); return; }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const r = canvas.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.bottom > 0 && r.top < vh) {       // skip drawing while scrolled away
      state.rotY += dt * 0.45;              // ~0.45 rad/s - a slow spin
      draw();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function init() {
  const sliders = [...document.querySelectorAll('[data-hero-compare]')];
  const panels = [...document.querySelectorAll('[data-hero-mesh]')];
  if (!sliders.length && !panels.length) return;

  // Wire the slider UI immediately so it works even if the mesh fails to load.
  const ranges = new Map(sliders.map((c) => [c, wireSlider(c)]));

  let mesh;
  try {
    const res = await fetch(MESH_PATH, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    mesh = parseOBJ(await res.text());
    if (!mesh.vertices.length || !mesh.faces.length) throw new Error('mesh has no geometry');
  } catch (err) {
    console.error('hero-compare:', err);
    return;
  }

  sliders.forEach((c) => renderSlider(c, ranges.get(c), mesh));
  panels.forEach((p) => startMeshSpin(p, mesh));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
