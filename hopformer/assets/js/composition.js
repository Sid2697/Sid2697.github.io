/*
 * Interactive "Dataset composition": an accessible bar chart of the 9 object
 * categories; selecting one loads a rotating 3D hand-object mesh of a
 * representative sample (reusing the demo's renderOBJCanvas) plus its RGB frame.
 *
 * Imports the same app.js URL/version as the <script> tag so the module loads
 * once and the dataset demo is not initialised twice.
 */
import {
  parseOBJ,
  renderOBJCanvas,
  normalizeVertices,
  meshPalette,
  buildVertexColorPalette,
} from './app.js?v=20';

const meshCache = new Map();
let activeToken = 0; // bumped on every selection; the latest one owns the spin loop

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

function spin(canvas, mesh, token) {
  const ctx = canvas.getContext('2d');
  const vertices = normalizeVertices(mesh.vertices);
  const palette = meshPalette('hand_object');
  const vcp = buildVertexColorPalette(mesh.vertexColors, palette);
  const state = { rotX: -0.35, rotY: 0.6, zoom: 1.0 };
  const draw = () => renderOBJCanvas(canvas, ctx, vertices, mesh.faces, mesh.groups, mesh.vertexColors, palette, vcp, state);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(); return; }

  let last = performance.now();
  function frame(now) {
    if (token !== activeToken) return; // a newer category took over
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const r = canvas.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.bottom > 0 && r.top < vh) {
      state.rotY += dt * 0.45; // slow spin
      draw();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function selectCategory(viewer, btn, buttons) {
  const token = ++activeToken;
  buttons.forEach((b) => {
    const active = b === btn;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', String(active));
  });

  const frameImg = viewer.querySelector('.composition-frame');
  if (frameImg) {
    frameImg.src = btn.dataset.frame;
    frameImg.alt = `${btn.dataset.label} example frame`;
  }
  const nameEl = viewer.querySelector('[data-cat-name]');
  const countEl = viewer.querySelector('[data-cat-count]');
  if (nameEl) nameEl.textContent = btn.dataset.label;
  if (countEl) countEl.textContent = btn.dataset.count;

  const canvas = viewer.querySelector('.composition-canvas');
  try {
    const mesh = await loadMesh(`dataset/${btn.dataset.sample}/hoi_mesh.obj`);
    if (token !== activeToken || !canvas) return; // superseded by a newer click
    spin(canvas, mesh, token);
  } catch (err) {
    console.error('composition:', err);
  }
}

function init() {
  const viewer = document.querySelector('[data-composition-viewer]');
  const buttons = [...document.querySelectorAll('.composition-bars .cbar')];
  if (!viewer || !buttons.length) return;
  buttons.forEach((btn) => btn.addEventListener('click', () => selectCategory(viewer, btn, buttons)));
  const initial = buttons.find((b) => b.classList.contains('is-active')) || buttons[0];
  selectCategory(viewer, initial, buttons);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
