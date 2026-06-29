// Qualitative comparison: each method's mesh cycles through fixed viewpoints
// while examples auto-advance. Reuses the Canvas-2D renderer from app.js.
import {
  parseOBJ,
  renderOBJCanvas,
  normalizeVertices,
  meshPalette,
  buildVertexColorPalette,
} from './app.js?v=22';

const METHODS = ['gt', 'arctic', 'jt', 'hopformer'];
const VIEW_MS = 1000;

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const meshCache = new Map();
let activeToken = 0;
let shuffleTimer = null;
let barAnims = [];
let paused = false;
let currentIndex = 0;
let viewIndex = 0;

function loadMesh(path) {
  if (!meshCache.has(path)) {
    meshCache.set(path, fetch(path, { cache: 'no-store' }).then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const mesh = parseOBJ(await res.text());
      if (!mesh.vertices.length || !mesh.faces.length) throw new Error('mesh has no geometry');
      return mesh;
    }).catch((err) => { meshCache.delete(path); throw err; }));
  }
  return meshCache.get(path);
}

const VIEWS = [
  { rotX: -0.35, rotY: 0.6, zoom: 1.0 },
  { rotX: -0.35, rotY: 0.6 + Math.PI / 2, zoom: 1.0 },
  { rotX: -0.35, rotY: 0.6 + Math.PI, zoom: 1.0 },
  { rotX: -0.35, rotY: 0.6 - Math.PI / 2, zoom: 1.0 },
];
const CYCLE_MS = VIEWS.length * VIEW_MS;

function prepareMesh(mesh) {
  const palette = meshPalette('hand_object');
  // Camera space is y-down / z-forward; rotate 180 degrees about X to stand upright.
  const vertices = normalizeVertices(mesh.vertices).map(([x, y, z]) => [x, -y, -z]);
  return {
    vertices,
    faces: mesh.faces,
    groups: mesh.groups,
    vertexColors: mesh.vertexColors,
    palette,
    vcp: buildVertexColorPalette(mesh.vertexColors, palette),
  };
}

function drawCell(cell) {
  const d = cell.data;
  renderOBJCanvas(cell.canvas, cell.ctx, d.vertices, d.faces, d.groups,
    d.vertexColors, d.palette, d.vcp, VIEWS[viewIndex], { hud: false });
}

let currentCells = [];
function renderViews() {
  currentCells.forEach((c) => drawCell(c));
}

function startBars(btn) {
  stopBars();
  if (REDUCED) return;
  const line = btn?.querySelector('.qual-frame-line');
  if (!line) return;
  barAnims = [line.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }],
    { duration: CYCLE_MS, easing: 'linear', fill: 'forwards' })];
}
function pauseBars() { barAnims.forEach((a) => a.pause()); }
function stopBars() { barAnims.forEach((a) => a.cancel()); barAnims = []; }

function clearTimer() {
  if (shuffleTimer) { clearTimeout(shuffleTimer); shuffleTimer = null; }
}

function scheduleCycle(viewer, buttons) {
  clearTimer();
  if (REDUCED || paused) { stopBars(); return; }
  startBars(buttons[currentIndex]);
  let shown = 1;
  const tick = () => {
    if (shown < VIEWS.length) {
      viewIndex = shown;
      renderViews();
      shown += 1;
      shuffleTimer = setTimeout(tick, VIEW_MS);
    } else if (buttons.length > 1) {
      selectSample(viewer, buttons[(currentIndex + 1) % buttons.length], buttons);
    } else {
      viewIndex = 0;
      renderViews();
      scheduleCycle(viewer, buttons);
    }
  };
  shuffleTimer = setTimeout(tick, VIEW_MS);
}

async function selectSample(viewer, btn, buttons) {
  const token = ++activeToken;
  currentIndex = Math.max(0, buttons.indexOf(btn));
  buttons.forEach((b) => {
    const active = b === btn;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', String(active));
  });

  const sample = btn.dataset.sample;

  viewer.querySelectorAll('.qual-col').forEach((col) => {
    const img = col.querySelector('.qual-proj');
    if (img) img.src = `qual/${sample}/${col.dataset.method}_proj.jpg`;
  });

  try {
    const meshes = await Promise.all(METHODS.map((m) => loadMesh(`qual/${sample}/${m}.obj`)));
    if (token !== activeToken) return;
    currentCells = METHODS.map((m, i) => {
      const canvas = viewer.querySelector(`.qual-col[data-method="${m}"] .qual-mesh-wrap canvas`);
      return canvas && { canvas, ctx: canvas.getContext('2d'), data: prepareMesh(meshes[i]) };
    }).filter(Boolean);
    viewIndex = 0;
    renderViews();
  } catch (err) {
    console.error('qual:', err);
  } finally {
    scheduleCycle(viewer, buttons);
  }
}

function init() {
  const viewer = document.querySelector('[data-qual-viewer]');
  const buttons = [...document.querySelectorAll('.qual-samples .qual-sample')];
  if (!viewer || !buttons.length) return;

  buttons.forEach((btn) => btn.addEventListener('click', () => selectSample(viewer, btn, buttons)));

  const picker = document.querySelector('.qual-samples');
  const pause = () => { paused = true; clearTimer(); pauseBars(); };
  const resume = () => { paused = false; viewIndex = 0; renderViews(); scheduleCycle(viewer, buttons); };
  [viewer, picker].forEach((el) => {
    if (!el) return;
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
  });

  let resizeRaf = null;
  new ResizeObserver(() => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => { resizeRaf = null; renderViews(); });
  }).observe(viewer);

  const initial = buttons.find((b) => b.classList.contains('is-active')) || buttons[0];
  selectSample(viewer, initial, buttons);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
