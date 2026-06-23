const PAPER_COUNTS = [
  ['bottle', 303], ['bowl', 415], ['can', 99], ['cup', 124], ['glass', 220],
  ['mug', 164], ['pan', 518], ['plate', 462], ['saucepan', 74]
];
const CATEGORIES = ['all', ...PAPER_COUNTS.map(([name]) => name)];

let manifest = { entries: [] };
let currentEntry = null;
let meshRuntime = null;
let handContactRuntime = null;
let objectContactRuntime = null;
let handContactLoadToken = 0;
let objectContactLoadToken = 0;
let evidenceRuntime = null;
let evidenceLoadToken = 0;
let activeView = 'hand-contact';
let visualState = {
  projection: 'hand_object',
  compareMode: 'wipe',
  amount: 72,
  focalLength: 5000,
  centerOffsetX: 0,
  centerOffsetY: 0,
};
let manifestMode = 'embedded';
let manifestPath = 'data/manifest.json';
let manifestFingerprint = '';
let manifestRefreshTimer = null;
const meshCache = new Map();
const CONTACT_NEUTRAL_COLOR = '#747c82';
const MANO_FINGERTIP_INDICES = [317, 444, 556, 673];
const MANO_PALM_REFERENCE_VERTICES = new Set([
  32, 34, 35, 44, 45, 62, 63, 64, 65, 66, 67, 69, 70, 71, 72, 73, 74, 75,
  76, 77, 93, 95, 96, 97, 98, 99, 101, 102, 103, 106, 109, 110, 128, 129,
  130, 131, 132, 138, 141, 142, 146, 147, 148, 149, 150, 151, 152, 154, 157,
  159, 168, 169, 172, 188, 196, 197, 198, 199, 228, 241, 242, 243, 244, 254,
  255, 268, 271, 275, 278, 284, 285, 288, 594, 595, 604, 605, 769, 770, 771,
  772, 773, 774, 775, 776, 777,
]);

const $ = (sel) => document.querySelector(sel);
const gallery = $('#gallery');
const emptyState = $('#empty-state');
const categoryFilter = $('#category-filter');
const handFilter = $('#hand-filter');
const searchInput = $('#search-input');
const statusEl = $('#manifest-status');

init();

async function init() {
  populateFilters();
  manifest = await loadManifest();
  manifestFingerprint = fingerprintManifest(manifest);
  updateManifestStatus();
  bindEvents();
  renderGallery();
  if (manifest.entries.length) selectEntry(manifest.entries[0]);
  startManifestAutoRefresh();
}

async function loadManifest() {
  try {
    const curatedRes = await fetch('data/showcase_manifest.json', { cache: 'no-store' });
    if (curatedRes.ok) {
      manifestMode = 'curated';
      manifestPath = 'data/showcase_manifest.json';
      return await curatedRes.json();
    }
  } catch (err) {
    // Fall through to the complete manifest.
  }
  try {
    const res = await fetch('data/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    manifestMode = 'live';
    return await res.json();
  } catch (err) {
    const embedded = document.getElementById('embedded-manifest');
    if (embedded?.textContent?.trim()) {
      manifestMode = 'embedded';
      return JSON.parse(embedded.textContent);
    }
    manifestMode = 'missing';
    return { entries: [] };
  }
}

function fingerprintManifest(value) {
  return JSON.stringify(value?.entries || []);
}

function updateManifestStatus(message = '') {
  if (message) {
    statusEl.textContent = message;
    return;
  }
  const count = manifest.entries.length;
  const noun = count === 1 ? 'entry' : 'entries';
  if (manifestMode === 'curated') {
    const sourceTotal = manifest.summary?.source_total_entries;
    statusEl.textContent = sourceTotal
      ? `${count} curated ${noun} · selected from ${formatNumber(sourceTotal)} samples`
      : `${count} curated ${noun}`;
  } else if (manifestMode === 'live') {
    statusEl.textContent = `${count} manifest ${noun} · watching for changes`;
  } else if (manifestMode === 'embedded') {
    statusEl.textContent = `${count} embedded ${noun} · run tools/serve.py for auto-indexing`;
  } else {
    statusEl.textContent = 'No manifest found.';
  }
}

function startManifestAutoRefresh() {
  if (!/^https?:$/.test(window.location.protocol)) return;
  window.clearInterval(manifestRefreshTimer);
  manifestRefreshTimer = window.setInterval(refreshManifest, 2500);
}

async function refreshManifest() {
  try {
    const separator = manifestPath.includes('?') ? '&' : '?';
    const res = await fetch(`${manifestPath}${separator}t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const nextManifest = await res.json();
    const nextFingerprint = fingerprintManifest(nextManifest);
    if (nextFingerprint === manifestFingerprint) return;

    const selectedId = currentEntry?.id;
    manifest = nextManifest;
    manifestMode = manifestPath.includes('showcase_manifest') ? 'curated' : 'live';
    manifestFingerprint = nextFingerprint;
    renderGallery();

    const selected = manifest.entries.find((entry) => entry.id === selectedId);
    const fallback = selected || manifest.entries[0];
    if (fallback) selectEntry(fallback);
    updateManifestStatus();
  } catch (err) {
    // Keep the current catalog visible if the server is briefly unavailable.
  }
}

function bindEvents() {
  [categoryFilter, handFilter, searchInput].forEach((el) => {
    el.addEventListener('input', renderGallery);
    el.addEventListener('change', renderGallery);
  });

  document.querySelectorAll('.view-tab').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });

  document.querySelectorAll('[data-compare-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      visualState.compareMode = button.dataset.compareMode;
      document.querySelectorAll('[data-compare-mode]').forEach((node) => {
        node.classList.toggle('is-active', node === button);
      });
      renderMedia(currentEntry);
    });
  });

  $('#blend-range').addEventListener('input', (event) => {
    visualState.amount = Number(event.target.value);
    updateVisualAmount();
  });

  [
    ['focal-length', 'focalLength'],
    ['center-offset-x', 'centerOffsetX'],
    ['center-offset-y', 'centerOffsetY'],
  ].forEach(([id, key]) => {
    $(`#${id}`).addEventListener('input', (event) => {
      const value = Number(event.target.value);
      if (!Number.isFinite(value) || (key === 'focalLength' && value <= 0)) return;
      visualState[key] = value;
      redrawEvidenceProjection();
    });
  });

  $('#reset-camera').addEventListener('click', () => {
    visualState.focalLength = 5000;
    visualState.centerOffsetX = 0;
    visualState.centerOffsetY = 0;
    syncCameraControls();
    redrawEvidenceProjection();
  });

  $('#previous-entry').addEventListener('click', () => stepEntry(-1));
  $('#next-entry').addEventListener('click', () => stepEntry(1));

  document.addEventListener('keydown', (event) => {
    const isTyping = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if (event.key === '/' && !isTyping) {
      event.preventDefault();
      searchInput.focus();
      return;
    }
    if (isTyping) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      stepEntry(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (/^[1-4]$/.test(event.key)) {
      switchView(['hand-contact', 'object-contact', 'evidence', 'geometry'][Number(event.key) - 1]);
    }
  });
}

function populateFilters() {
  categoryFilter.innerHTML = CATEGORIES.map((cat) => `<option value="${cat}">${cat === 'all' ? 'All objects' : titleCase(cat)}</option>`).join('');
}

function getAllEntries() {
  return manifest.entries;
}

function getModalities(entry) {
  return {
    frame: Boolean(entry.thumbnail || entry.images?.length),
    projection: Boolean(entry.projections?.length),
    contact: Boolean(Object.keys(entry.annotations || {}).length),
    mesh: Boolean(Object.keys(entry.meshes || {}).length),
    video: Boolean(entry.video),
  };
}

function filteredEntries() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  const hand = handFilter.value;
  return getAllEntries().filter((entry) => {
    const text = [entry.id, entry.title, entry.category, entry.hand, entry.type].join(' ').toLowerCase();
    const matchesSearch = !q || text.includes(q);
    const matchesCat = cat === 'all' || entry.category === cat;
    const matchesHand = hand === 'all' || entry.hand === hand;
    return matchesSearch && matchesCat && matchesHand;
  });
}

function renderGallery() {
  const entries = filteredEntries();
  $('#result-count').textContent = `${entries.length} result${entries.length === 1 ? '' : 's'}`;
  gallery.innerHTML = entries.map((entry) => cardHTML(entry)).join('');
  emptyState.hidden = entries.length !== 0;
  gallery.querySelectorAll('[data-entry-id]').forEach((node) => {
    node.addEventListener('click', () => {
      const entry = getAllEntries().find((item) => item.id === node.dataset.entryId);
      if (entry) selectEntry(entry);
    });
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        node.click();
      }
    });
  });
  markActiveCard();
  updateStepperState();
}

function cardHTML(entry) {
  const thumb = entry.thumbnail ? `<img src="${escapeAttr(entry.thumbnail)}" alt="Preview for ${escapeAttr(entry.title)}" loading="lazy">`
    : entry.video ? `<video src="${escapeAttr(entry.video)}" muted playsinline preload="metadata"></video>`
      : `<span>No preview</span>`;
  const modalities = getModalities(entry);
  return `
    <article class="card" data-entry-id="${escapeAttr(entry.id)}" tabindex="0" aria-label="Open ${escapeAttr(entry.title)}">
      <div class="thumb">${thumb}</div>
      <div class="card-body">
        <div class="card-title">${escapeHTML(entry.title)}</div>
        <div class="badges">
          <span class="badge">${escapeHTML(entry.category || 'unknown')}</span>
          <span class="badge">${escapeHTML(entry.hand || 'unknown')}</span>
        </div>
        <div class="card-modalities" aria-label="Available modalities">
          ${Object.entries(modalities).map(([name, available]) => `<i class="modality-dot ${available ? 'has-data' : ''}" title="${escapeAttr(name)}"></i>`).join('')}
        </div>
      </div>
    </article>`;
}

function markActiveCard() {
  gallery.querySelectorAll('.card').forEach((node) => node.classList.toggle('is-active', currentEntry && node.dataset.entryId === currentEntry.id));
}

function selectEntry(entry) {
  currentEntry = entry;
  visualState.projection = entry.meshes?.hand_object ? 'hand_object' : null;
  visualState.amount = 72;
  visualState.centerOffsetX = 0;
  visualState.centerOffsetY = 0;
  const videoId = (entry.id.match(/^P\d+_\d+/) || [''])[0];
  $('#detail-title').innerHTML = [
    entry.hand ? `${titleCase(entry.hand)} hand` : null,
    videoId,
    entry.category ? titleCase(entry.category) : null,
  ].filter(Boolean).map((label) => `<span class="sample-pill">${escapeHTML(label)}</span>`).join('');
  $('#detail-meta').textContent = '';
  const projectionPaths = new Set(entry.projections || []);
  const thumbnailPath = entry.thumbnail || entry.images?.find((path) => !projectionPaths.has(path));
  const activeThumbnail = $('#active-sample-thumbnail');
  if (thumbnailPath) {
    activeThumbnail.src = thumbnailPath;
    activeThumbnail.alt = `RGB frame for ${entry.title}`;
    activeThumbnail.hidden = false;
  } else {
    activeThumbnail.removeAttribute('src');
    activeThumbnail.alt = '';
    activeThumbnail.hidden = true;
  }
  syncCameraControls();
  renderMedia(entry);
  renderHandContactViz(entry);
  renderObjectContactViz(entry);
  renderAnnotations(entry);
  renderMeshPanel(entry);
  markActiveCard();
  updateStepperState();
}

async function renderMedia(entry) {
  const stage = $('#media-stage');
  if (!entry) return;
  const requestToken = ++evidenceLoadToken;
  evidenceRuntime = null;
  stage.className = `media-stage${visualState.compareMode === 'wipe' ? ' is-wipe' : ''}`;
  if (entry.video) {
    stage.innerHTML = `<video src="${escapeAttr(entry.video)}" controls playsinline preload="metadata"></video>`;
    $('#visual-controls').hidden = true;
    $('#evidence-caption').textContent = 'Video playback is local to this browser session.';
    return;
  }

  const projectionPaths = new Set(entry.projections || []);
  const base = entry.thumbnail || entry.images?.find((path) => !projectionPaths.has(path));
  if (!base) {
    stage.classList.add('placeholder');
    stage.textContent = 'No media asset available for this entry.';
    $('#visual-controls').hidden = true;
    return;
  }

  const meshKey = visualState.projection;
  const meshInfo = meshKey ? entry.meshes?.[meshKey] : null;
  stage.style.setProperty('--overlay-opacity', visualState.amount / 100);
  stage.style.setProperty('--wipe-position', `${visualState.amount}%`);
  stage.innerHTML = `
    <div class="camera-frame">
      <img id="evidence-frame" src="${escapeAttr(base)}" alt="${escapeAttr(entry.title)} source frame">
      ${meshInfo ? `<canvas id="evidence-projection" class="projection-canvas overlay" role="img" aria-label="${escapeAttr(meshProjectionLabel(meshKey))} projected into the source frame"></canvas>` : ''}
    </div>
    <span class="layer-tag base">${meshInfo ? 'RGB source' : 'RGB frame'}</span>
    ${meshInfo ? `
      <span id="projection-layer-label" class="layer-tag overlay-label">Projecting mesh...</span>
      <i class="wipe-line" aria-hidden="true"></i>
      <input id="wipe-range-overlay" class="wipe-range-overlay" type="range" min="0" max="100" value="${visualState.amount}" aria-label="Move comparison divider">
    ` : ''}`;
  $('#visual-controls').hidden = !meshInfo;
  $('#blend-range').value = visualState.amount;
  $('.blend-control').hidden = visualState.compareMode === 'wipe';
  $('#evidence-caption').textContent = meshInfo
    ? `Loading the camera-space ${meshProjectionLabel(meshKey).toLowerCase()} for live projection.`
    : 'Unmodified source frame.';
  $('#wipe-range-overlay')?.addEventListener('input', (event) => {
    visualState.amount = Number(event.target.value);
    updateVisualAmount();
  });
  updateVisualAmount();

  if (!meshInfo) return;

  const image = $('#evidence-frame');
  const canvas = $('#evidence-projection');
  try {
    const [mesh] = await Promise.all([
      loadOBJMesh(meshInfo.path),
      waitForImage(image),
    ]);
    if (requestToken !== evidenceLoadToken || currentEntry?.id !== entry.id || visualState.projection !== meshKey) return;
    image.parentElement.style.setProperty('--frame-ratio', `${image.naturalWidth} / ${image.naturalHeight}`);
    evidenceRuntime = { entryId: entry.id, meshKey, mesh, image, canvas };
    redrawEvidenceProjection();
  } catch (err) {
    console.error(err);
    if (requestToken !== evidenceLoadToken) return;
    $('#projection-layer-label').textContent = 'Projection unavailable';
    $('#evidence-caption').textContent = 'The mesh could not be loaded. Serve the site over HTTP so OBJ files can be fetched.';
  }
}

function meshProjectionLabel(key) {
  return {
    hand: 'Hand mesh',
    hand_object: 'Hand + object',
    object: 'Object mesh',
  }[key] || titleCase(String(key || '').replace(/_/g, ' '));
}

function updateVisualAmount() {
  const stage = $('#media-stage');
  stage.style.setProperty('--overlay-opacity', visualState.amount / 100);
  stage.style.setProperty('--wipe-position', `${visualState.amount}%`);
  const wipeRange = $('#wipe-range-overlay');
  if (wipeRange && Number(wipeRange.value) !== visualState.amount) wipeRange.value = visualState.amount;
  $('#blend-label').textContent = visualState.compareMode === 'wipe' ? 'Overlay reveal' : 'Overlay opacity';
  $('#blend-output').textContent = `${visualState.amount}%`;
}

function syncCameraControls() {
  $('#focal-length').value = visualState.focalLength;
  $('#center-offset-x').value = visualState.centerOffsetX;
  $('#center-offset-y').value = visualState.centerOffsetY;
}

function waitForImage(image) {
  if (image.complete && image.naturalWidth) return Promise.resolve(image);
  return new Promise((resolve, reject) => {
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error('Frame image failed to load')), { once: true });
  });
}

async function loadOBJMesh(path) {
  if (!meshCache.has(path)) {
    meshCache.set(path, fetch(path, { cache: 'no-store' }).then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const mesh = parseOBJ(await res.text());
      if (!mesh.vertices.length || !mesh.faces.length) throw new Error('OBJ has no drawable geometry');
      return mesh;
    }).catch((err) => {
      meshCache.delete(path);
      throw err;
    }));
  }
  return meshCache.get(path);
}

function redrawEvidenceProjection() {
  if (!evidenceRuntime || evidenceRuntime.entryId !== currentEntry?.id) return;
  const { mesh, meshKey, image, canvas } = evidenceRuntime;
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return;

  drawCameraSpaceMesh(canvas, mesh, meshKey, width, height);
  const cx = width / 2 + visualState.centerOffsetX;
  const cy = height / 2 + visualState.centerOffsetY;
  const label = $('#projection-layer-label');
  if (label) label.textContent = meshProjectionLabel(meshKey);
  $('#evidence-caption').textContent =
    `Live face projection from camera-space geometry · f ${formatCameraValue(visualState.focalLength)} px · principal point (${formatCameraValue(cx)}, ${formatCameraValue(cy)}).`;
}

export function drawCameraSpaceMesh(canvas, mesh, kind, width, height, camera = visualState) {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Focal length is calibrated for the 456px-wide EPIC frames; scale it with the
  // frame width so the projection stays aligned at any resolution (e.g. 1920px).
  const focal = camera.focalLength * (width / 456);
  const cx = width / 2 + camera.centerOffsetX;
  const cy = height / 2 + camera.centerOffsetY;
  const projected = mesh.vertices.map(([x, y, z]) => (
    z > 1e-6 ? [focal * x / z + cx, focal * y / z + cy, z] : null
  ));
  const palette = meshPalette(kind);
  const vertexColorPalette = buildVertexColorPalette(mesh.vertexColors, palette);
  const drawFaces = [];

  for (let index = 0; index < mesh.faces.length; index++) {
    const face = mesh.faces[index];
    const p0 = projected[face[0]];
    const p1 = projected[face[1]];
    const p2 = projected[face[2]];
    if (!p0 || !p1 || !p2) continue;
    if (triangleOutsideFrame(p0, p1, p2, width, height)) continue;
    const normal = faceNormal(mesh.vertices[face[0]], mesh.vertices[face[1]], mesh.vertices[face[2]]);
    drawFaces.push({
      index,
      depth: (p0[2] + p1[2] + p2[2]) / 3,
      shade: 0.72 + Math.abs(normal[2]) * 0.34,
    });
  }

  // Camera depth increases away from the image plane, so paint far faces first.
  drawFaces.sort((a, b) => b.depth - a.depth);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  for (const item of drawFaces) {
    const face = mesh.faces[item.index];
    const p0 = projected[face[0]];
    const p1 = projected[face[1]];
    const p2 = projected[face[2]];
    const color = chooseMeshColor(
      palette,
      mesh.groups[item.index],
      item.index,
      mesh.faces.length,
      face,
      mesh.vertexColors,
      vertexColorPalette,
    );
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, item.shade, 0.78);
    ctx.fill();
    ctx.strokeStyle = 'rgba(8, 12, 14, 0.34)';
    ctx.lineWidth = 0.42;
    ctx.stroke();
  }
}

function triangleOutsideFrame(a, b, c, width, height) {
  return (a[0] < 0 && b[0] < 0 && c[0] < 0)
    || (a[0] > width && b[0] > width && c[0] > width)
    || (a[1] < 0 && b[1] < 0 && c[1] < 0)
    || (a[1] > height && b[1] > height && c[1] > height);
}

function formatCameraValue(value) {
  return Number(value).toLocaleString('en', { maximumFractionDigits: 1 });
}

function switchView(view) {
  activeView = view;
  document.querySelectorAll('.view-tab').forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-view-panel]').forEach((panel) => {
    const active = panel.dataset.viewPanel === view;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });
}

function stepEntry(direction) {
  const entries = filteredEntries();
  if (!entries.length) return;
  const currentIndex = entries.findIndex((entry) => entry.id === currentEntry?.id);
  const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + entries.length) % entries.length;
  selectEntry(entries[nextIndex]);
  gallery.querySelector(`[data-entry-id="${CSS.escape(entries[nextIndex].id)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function updateStepperState() {
  const disabled = filteredEntries().length < 2;
  $('#previous-entry').disabled = disabled;
  $('#next-entry').disabled = disabled;
}

async function renderHandContactViz(entry) {
  const container = $('#hand-contact-viz');
  const { dense, sparse } = getContactSummaries(entry);
  const parts = ['fingers', 'thumb', 'palm'];
  const denseTotal = parts.reduce((sum, part) => sum + Number(dense[part] || 0), 0);
  const sparseTotal = parts.reduce((sum, part) => sum + Number(sparse[part] || 0), 0);
  const maxSparse = Math.max(...parts.map((part) => Number(sparse[part] || 0)), 1);
  const handMesh = entry.meshes?.hand;
  const sparseAnnotation = Object.entries(entry.annotations || {}).find(([name]) => /contact_vertices_sparse/i.test(name))?.[1];
  const requestToken = ++handContactLoadToken;
  let activeContactPart = 'all';
  let contactFaceCounts = null;

  if (handContactRuntime?.destroy) handContactRuntime.destroy();
  handContactRuntime = null;

  if (!sparseTotal || !handMesh || !sparseAnnotation?.path) {
    container.innerHTML = '<div class="asset-empty">No contact annotations are available for this sample.</div>';
    return;
  }

  container.innerHTML = `
    <div class="contact-mesh-lab">
      <div class="contact-mesh-toolbar">
        <div>
          <span class="control-label">MANO contact surface</span>
          <strong>${formatNumber(handMesh.vertices)} vertices · ${formatNumber(handMesh.faces)} faces</strong>
        </div>
        <div class="contact-filter" aria-label="Contact region filter">
          <button type="button" class="is-active" data-contact-filter="all">All</button>
          ${parts.map((part) => `<button type="button" data-contact-filter="${part}">${titleCase(part)}</button>`).join('')}
        </div>
      </div>
      <div id="contact-mesh-viewer" class="contact-mesh-viewer">
        <div class="mesh-loading">Loading hand mesh and contact faces...</div>
      </div>
      <div class="contact-legend">
        ${parts.map((part) => `<span><i style="--region-color:${contactRegionColor(part)}"></i>${titleCase(part)}</span>`).join('')}
        <span><i style="--region-color:${CONTACT_NEUTRAL_COLOR}"></i>No contact</span>
        <span class="contact-legend-note">Drag rotate · wheel zoom · hover a face</span>
      </div>
    </div>
    <div class="contact-breakdown">
      <div class="contact-total">
        <strong data-contact-total>${formatNumber(sparseTotal)}</strong>
        <span data-contact-total-label>source MANO contact vertices</span>
        <small>${formatNumber(denseTotal)} dense labels on the subdivided annotation topology</small>
      </div>
      <div class="contact-rows">
        ${parts.map((part) => {
          const sparseValue = Number(sparse[part] || 0);
          const denseValue = Number(dense[part] || 0);
          return `
            <button class="contact-row" type="button" data-contact-part="${part}">
              <strong>${part}</strong>
              <span class="contact-bar"><i data-contact-bar="${part}" style="--contact-width:${(sparseValue / maxSparse) * 100}%;--contact-color:${contactRegionColor(part)}"></i></span>
              <span data-contact-count="${part}">${formatNumber(sparseValue)}</span>
            </button>`;
        }).join('')}
      </div>
      <div data-contact-focus class="contact-focus">Contact faces are derived from the sparse MANO vertex labels. Select a region to isolate it.</div>
    </div>`;

  const activatePart = (part) => {
    activeContactPart = part;
    container.querySelectorAll('[data-contact-filter]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.contactFilter === part);
    });
    container.querySelectorAll('[data-contact-part]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.contactPart === part);
    });
    handContactRuntime?.setActivePart(part);
    if (part === 'all') {
      container.querySelector('[data-contact-focus]').textContent = 'Contact faces are derived from the sparse MANO vertex labels. Select a region to isolate it.';
    } else {
      const denseValue = Number(dense[part] || 0);
      const sparseValue = Number(sparse[part] || 0);
      const share = denseTotal ? Math.round((denseValue / denseTotal) * 100) : 0;
      const faceValue = contactFaceCounts?.[part];
      const faceText = Number.isFinite(faceValue) ? `${formatNumber(faceValue)} colored faces from ` : '';
      container.querySelector('[data-contact-focus]').innerHTML = `<strong>${titleCase(part)}</strong> covers ${faceText}${formatNumber(sparseValue)} MANO vertices and contains ${share}% of dense labels (${formatNumber(denseValue)}).`;
    }
  };

  container.querySelectorAll('[data-contact-filter]').forEach((node) => {
    node.addEventListener('click', () => activatePart(node.dataset.contactFilter));
  });
  container.querySelectorAll('[data-contact-part]').forEach((node) => {
    node.addEventListener('click', () => activatePart(node.dataset.contactPart));
  });

  try {
    const [meshRes, contactRes] = await Promise.all([
      fetch(handMesh.path, { cache: 'no-store' }),
      fetch(sparseAnnotation.path, { cache: 'no-store' }),
    ]);
    if (!meshRes.ok || !contactRes.ok) throw new Error('Contact assets could not be loaded');
    const [objText, contactData] = await Promise.all([meshRes.text(), contactRes.json()]);
    if (requestToken !== handContactLoadToken || currentEntry?.id !== entry.id) return;

    const mesh = parseOBJ(objText);
    const contacts = normalizeContactVertices(contactData, handMesh.vertices);
    const viewer = $('#contact-mesh-viewer');
    if (!viewer) return;
    viewer.innerHTML = '';
    handContactRuntime = createContactCanvasViewer(viewer, mesh, contacts, entry.title, {
      surfaceLabel: 'hand',
      orientPalm: true,
    });
    contactFaceCounts = handContactRuntime.faceCounts;
    const totalContactFaces = Object.values(contactFaceCounts).reduce((sum, count) => sum + count, 0);
    const maxFaces = Math.max(...Object.values(contactFaceCounts), 1);
    container.querySelector('[data-contact-total]').textContent = formatNumber(totalContactFaces);
    container.querySelector('[data-contact-total-label]').textContent = 'colored MANO contact faces';
    for (const part of parts) {
      const count = contactFaceCounts[part] || 0;
      const countNode = container.querySelector(`[data-contact-count="${part}"]`);
      const barNode = container.querySelector(`[data-contact-bar="${part}"]`);
      if (countNode) countNode.textContent = formatNumber(count);
      if (barNode) barNode.style.setProperty('--contact-width', `${(count / maxFaces) * 100}%`);
    }
    handContactRuntime.setActivePart(activeContactPart);
  } catch (err) {
    if (requestToken !== handContactLoadToken) return;
    console.error(err);
    const viewer = $('#contact-mesh-viewer');
    if (viewer) {
      viewer.innerHTML = `
        <div class="mesh-error">
          <strong>Could not load the contact mesh.</strong>
          <span>Run the site with <code>python tools/serve.py</code> so the browser can fetch the OBJ and contact JSON files.</span>
        </div>`;
    }
  }
}

async function renderObjectContactViz(entry) {
  const container = $('#object-contact-viz');
  const parts = ['fingers', 'thumb', 'palm'];
  const objectMesh = entry.meshes?.object;
  const contactAnnotation = Object.entries(entry.annotations || {}).find(([name]) => /corresponding_contacts/i.test(name))?.[1];
  const requestToken = ++objectContactLoadToken;
  let activeContactPart = 'all';

  if (objectContactRuntime?.destroy) objectContactRuntime.destroy();
  objectContactRuntime = null;

  if (!objectMesh || !contactAnnotation?.path) {
    container.innerHTML = '<div class="asset-empty">No object contact annotations are available for this sample.</div>';
    return;
  }

  container.innerHTML = `
    <div class="contact-mesh-lab">
      <div class="contact-mesh-toolbar">
        <div>
          <span class="control-label">Object contact surface</span>
          <strong>${formatNumber(objectMesh.vertices)} vertices · ${formatNumber(objectMesh.faces)} faces</strong>
        </div>
        <div class="contact-filter" aria-label="Object contact region filter">
          <button type="button" class="is-active" data-contact-filter="all">All</button>
          ${parts.map((part) => `<button type="button" data-contact-filter="${part}">${titleCase(part)}</button>`).join('')}
        </div>
      </div>
      <div data-object-contact-viewer class="contact-mesh-viewer">
        <div class="mesh-loading">Loading object mesh and corresponding contacts...</div>
      </div>
      <div class="contact-legend">
        ${parts.map((part) => `<span><i style="--region-color:${contactRegionColor(part)}"></i>${titleCase(part)}</span>`).join('')}
        <span><i style="--region-color:${CONTACT_NEUTRAL_COLOR}"></i>No contact</span>
        <span class="contact-legend-note">Drag rotate · wheel zoom · hover a face</span>
      </div>
    </div>
    <div class="contact-breakdown">
      <div class="contact-total">
        <strong data-contact-total>…</strong>
        <span data-contact-total-label>loading object contacts</span>
        <small>Face labels are read from the object-side entries in corresponding_contacts.json.</small>
      </div>
      <div class="contact-rows">
        ${parts.map((part) => `
          <button class="contact-row" type="button" data-contact-part="${part}">
            <strong>${part}</strong>
            <span class="contact-bar"><i data-contact-bar="${part}" style="--contact-width:0%;--contact-color:${contactRegionColor(part)}"></i></span>
            <span data-contact-count="${part}">…</span>
          </button>`).join('')}
      </div>
      <div data-contact-focus class="contact-focus">Select a hand region to isolate its corresponding object contact faces.</div>
    </div>`;

  const activatePart = (part) => {
    activeContactPart = part;
    container.querySelectorAll('[data-contact-filter]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.contactFilter === part);
    });
    container.querySelectorAll('[data-contact-part]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.contactPart === part);
    });
    objectContactRuntime?.setActivePart(part);
    container.querySelector('[data-contact-focus]').textContent = part === 'all'
      ? 'Select a hand region to isolate its corresponding object contact faces.'
      : `${titleCase(part)} contact transferred onto the object surface.`;
  };

  container.querySelectorAll('[data-contact-filter]').forEach((node) => {
    node.addEventListener('click', () => activatePart(node.dataset.contactFilter));
  });
  container.querySelectorAll('[data-contact-part]').forEach((node) => {
    node.addEventListener('click', () => activatePart(node.dataset.contactPart));
  });

  try {
    const [meshRes, contactRes] = await Promise.all([
      fetch(objectMesh.path, { cache: 'no-store' }),
      fetch(contactAnnotation.path, { cache: 'no-store' }),
    ]);
    if (!meshRes.ok || !contactRes.ok) throw new Error('Object contact assets could not be loaded');
    const [objText, contactData] = await Promise.all([meshRes.text(), contactRes.json()]);
    if (requestToken !== objectContactLoadToken || currentEntry?.id !== entry.id) return;

    const mesh = parseOBJ(objText);
    const contactFaces = parseObjectContactFaces(contactData, mesh.faces.length);
    const viewer = container.querySelector('[data-object-contact-viewer]');
    viewer.innerHTML = '';
    objectContactRuntime = createContactCanvasViewer(viewer, mesh, null, entry.title, {
      contactFaces,
      surfaceLabel: 'object',
    });
    const faceCounts = objectContactRuntime.faceCounts;
    const totalContactFaces = Object.values(faceCounts).reduce((sum, count) => sum + count, 0);
    const maxFaces = Math.max(...Object.values(faceCounts), 1);
    container.querySelector('[data-contact-total]').textContent = formatNumber(totalContactFaces);
    container.querySelector('[data-contact-total-label]').textContent = 'colored object contact faces';
    for (const part of parts) {
      const count = faceCounts[part] || 0;
      container.querySelector(`[data-contact-count="${part}"]`).textContent = formatNumber(count);
      container.querySelector(`[data-contact-bar="${part}"]`).style.setProperty('--contact-width', `${(count / maxFaces) * 100}%`);
    }
    objectContactRuntime.setActivePart(activeContactPart);
  } catch (err) {
    if (requestToken !== objectContactLoadToken) return;
    console.error(err);
    const viewer = container.querySelector('[data-object-contact-viewer]');
    if (viewer) {
      viewer.innerHTML = `
        <div class="mesh-error">
          <strong>Could not load the object contacts.</strong>
          <span>Serve the static site over HTTP so the browser can fetch OBJ and JSON assets.</span>
        </div>`;
    }
  }
}

function getContactSummaries(entry) {
  const annotations = Object.entries(entry.annotations || {});
  const denseInfo = annotations.find(([name]) => /bodyparts/i.test(name))?.[1];
  const sparseInfo = annotations.find(([name]) => /sparse/i.test(name))?.[1];
  return {
    dense: denseInfo?.summary || {},
    sparse: sparseInfo?.summary || {},
  };
}

function normalizeContactVertices(data, vertexCount) {
  const normalized = {};
  for (const part of ['fingers', 'thumb', 'palm']) {
    normalized[part] = [...new Set((Array.isArray(data?.[part]) ? data[part] : [])
      .map(Number)
      .filter((index) => Number.isInteger(index) && index >= 0 && index < vertexCount))];
  }
  return normalized;
}

function parseObjectContactFaces(data, faceCount) {
  const parts = ['fingers', 'thumb', 'palm'];
  const countsByFace = Array.from({ length: faceCount }, () => null);
  for (const region of Array.isArray(data?.data) ? data.data : []) {
    const match = String(region?.name || '').match(/^objShape(fingers|thumb|palm)$/i);
    if (!match) continue;
    const part = match[1].toLowerCase();
    for (const point of Array.isArray(region.contactPoints) ? region.contactPoints : []) {
      const faceMatch = String(point).match(/^f\s+(\d+)\b/);
      const faceIndex = faceMatch ? Number(faceMatch[1]) : -1;
      if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= faceCount) continue;
      if (!countsByFace[faceIndex]) countsByFace[faceIndex] = { fingers: 0, thumb: 0, palm: 0 };
      countsByFace[faceIndex][part] += 1;
    }
  }
  return countsByFace.map((counts, faceIndex) => {
    if (!counts) return null;
    const part = parts.reduce((best, candidate) => counts[candidate] > counts[best] ? candidate : best, parts[0]);
    return {
      faceIndex,
      part,
      coverage: 1,
      pointCount: counts[part],
      contactVertices: [],
    };
  });
}

function contactRegionColor(part) {
  return {
    fingers: '#ffd34e',
    thumb: '#ff6f61',
    palm: '#67e5bd',
  }[part] || '#ffffff';
}

function renderAnnotations(entry) {
  const container = $('#annotation-summary');
  const annotations = Object.entries(entry.annotations || {});
  if (!annotations.length) {
    container.innerHTML = '<p class="muted">No annotation JSON files found for this entry.</p>';
    return;
  }
  container.innerHTML = annotations.map(([name, info]) => {
    const summary = summarizeAnnotation(info.summary);
    return `<div class="annotation-item"><strong>${escapeHTML(name)}</strong><br><code>${escapeHTML(summary)}</code></div>`;
  }).join('');
}

function summarizeAnnotation(summary) {
  if (!summary) return 'summary unavailable';
  if ('fingers' in summary || 'thumb' in summary || 'palm' in summary) {
    return `fingers: ${summary.fingers || 0}, thumb: ${summary.thumb || 0}, palm: ${summary.palm || 0}`;
  }
  if ('contact_regions' in summary) return `contact regions: ${summary.contact_regions}`;
  if ('matrix_shape' in summary) return `matrix shape: ${summary.matrix_shape.join(' x ')}`;
  return JSON.stringify(summary);
}

function renderMeshPanel(entry) {
  const panel = $('#mesh-panel');
  const meshes = Object.entries(entry.meshes || {});
  if (!meshes.length) {
    panel.innerHTML = '<p class="mesh-note">No OBJ mesh files found for this entry.</p>';
    return;
  }
  panel.innerHTML = `
    <div class="mesh-toolbar">
      <select id="mesh-select" class="mesh-select" aria-label="Mesh to display">
        ${meshes.map(([key, mesh]) => `<option value="${escapeAttr(key)}">${escapeHTML(titleCase(key.replace('_', ' ')))} · ${formatNumber(mesh.vertices)} vertices · ${formatNumber(mesh.faces)} faces</option>`).join('')}
      </select>
      <div class="mesh-summary">${meshes.length} posed mesh${meshes.length === 1 ? '' : 'es'}</div>
    </div>
    <div id="mesh-viewer" class="mesh-viewer">Select a mesh to load the 3D viewer.</div>
    <p class="mesh-note">Drag to rotate · scroll or pinch to zoom · double-click to reset.</p>`;
  const select = $('#mesh-select');
  const loadSelected = () => {
    const mesh = entry.meshes[select.value];
    loadMesh(mesh.path, select.options[select.selectedIndex].textContent, select.value);
  };
  select.addEventListener('change', loadSelected);
  loadSelected();
}

function formatNumber(value) {
  return new Intl.NumberFormat('en', { notation: Number(value) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(Number(value) || 0);
}

async function loadMesh(path, label, kind = 'object') {
  const viewer = $('#mesh-viewer');
  if (!viewer) return;

  if (meshRuntime?.destroy) meshRuntime.destroy();
  meshRuntime = null;

  viewer.innerHTML = `<div class="mesh-loading">Loading ${escapeHTML(label)}...</div>`;

  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const objText = await res.text();
    const mesh = parseOBJ(objText);
    if (!mesh.vertices.length || !mesh.faces.length) throw new Error('OBJ has no drawable geometry');
    viewer.innerHTML = '';
    meshRuntime = createOBJCanvasViewer(viewer, mesh, label, kind);
  } catch (err) {
    console.error(err);
    viewer.innerHTML = `
      <div class="mesh-error">
        <strong>Could not load this OBJ mesh.</strong>
        <span>Open the site from a local server, e.g. <code>python -m http.server 8000</code>, then visit <code>http://localhost:8000</code>. Browsers block OBJ fetches when opening <code>index.html</code> directly from disk.</span>
      </div>`;
  }
}

export function parseOBJ(text) {
  const vertices = [];
  const vertexColors = [];
  const faces = [];
  const groups = [];
  let currentGroup = 'default';

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    const tag = parts[0];

    if (tag === 'v' && parts.length >= 4) {
      const x = Number(parts[1]);
      const y = Number(parts[2]);
      const z = Number(parts[3]);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        vertices.push([x, y, z]);
        const color = parts.length >= 7 ? [Number(parts[4]), Number(parts[5]), Number(parts[6])] : null;
        vertexColors.push(color?.every(Number.isFinite) ? color : null);
      }
      continue;
    }

    if ((tag === 'g' || tag === 'o') && parts.length > 1) {
      currentGroup = parts.slice(1).join(' ');
      continue;
    }

    if (tag === 'f' && parts.length >= 4) {
      const indices = parts.slice(1).map((token) => parseOBJIndex(token, vertices.length)).filter((i) => i !== null);
      if (indices.length < 3) continue;
      for (let i = 1; i < indices.length - 1; i++) {
        faces.push([indices[0], indices[i], indices[i + 1]]);
        groups.push(currentGroup);
      }
    }
  }
  return { vertices, vertexColors, faces, groups };
}

function parseOBJIndex(token, vertexCount) {
  const raw = token.split('/')[0];
  const idx = Number.parseInt(raw, 10);
  if (!Number.isFinite(idx) || idx === 0) return null;
  const resolved = idx > 0 ? idx - 1 : vertexCount + idx;
  return resolved >= 0 && resolved < vertexCount ? resolved : null;
}

function createContactCanvasViewer(container, mesh, contacts, label, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'contact-canvas-viewer';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${label} ${options.surfaceLabel || 'mesh'} with colored contact faces`);
  container.appendChild(canvas);

  const controls = document.createElement('div');
  controls.className = 'mesh-controls';
  controls.textContent = 'Drag rotate · wheel zoom · double-click reset';
  container.appendChild(controls);

  const tooltip = document.createElement('div');
  tooltip.className = 'contact-face-tooltip';
  tooltip.hidden = true;
  container.appendChild(tooltip);

  const ctx = canvas.getContext('2d');
  const normalizedVertices = normalizeVertices(mesh.vertices);
  const vertices = options.orientPalm
    ? orientHandPalmForward(normalizedVertices, mesh.faces)
    : normalizedVertices;
  const contactFaces = options.contactFaces || buildContactFaces(mesh.faces, contacts || {});
  const surfacePalette = [CONTACT_NEUTRAL_COLOR];
  const vertexColorPalette = buildVertexColorPalette(mesh.vertexColors, surfacePalette);
  const faceCounts = { fingers: 0, thumb: 0, palm: 0 };
  for (const contact of contactFaces) {
    if (contact) faceCounts[contact.part] += 1;
  }
  const initialRotation = options.orientPalm
    ? { rotX: 0, rotY: 0 }
    : { rotX: -0.42, rotY: 0.2 };
  const state = {
    ...initialRotation,
    zoom: 1.0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    raf: null,
    activePart: 'all',
    hovered: null,
    projectedFaces: [],
  };

  const resizeObserver = new ResizeObserver(() => requestRender());
  resizeObserver.observe(container);

  const pointerDown = (event) => {
    state.dragging = true;
    state.hovered = null;
    tooltip.hidden = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };
  const pointerMove = (event) => {
    if (state.dragging) {
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.rotY += dx * 0.012;
      state.rotX = clamp(state.rotX + dy * 0.012, -Math.PI * 0.95, Math.PI * 0.95);
      requestRender();
      return;
    }
    updateContactHover(event, canvas, container, tooltip, state, requestRender);
  };
  const pointerUp = (event) => {
    state.dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  const pointerLeave = () => {
    if (state.dragging) return;
    state.hovered = null;
    tooltip.hidden = true;
    requestRender();
  };
  const wheel = (event) => {
    event.preventDefault();
    state.zoom = clamp(state.zoom * Math.exp(-event.deltaY * 0.0012), 0.3, 5);
    requestRender();
  };
  const reset = () => {
    state.rotX = initialRotation.rotX;
    state.rotY = initialRotation.rotY;
    state.zoom = 1.0;
    state.hovered = null;
    tooltip.hidden = true;
    requestRender();
  };

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('wheel', wheel, { passive: false });
  canvas.addEventListener('dblclick', reset);

  function requestRender() {
    if (state.raf) return;
    state.raf = requestAnimationFrame(() => {
      state.raf = null;
      renderContactCanvas(
        canvas,
        ctx,
        vertices,
        mesh.faces,
        mesh.groups,
        mesh.vertexColors,
        vertexColorPalette,
        contactFaces,
        state,
      );
    });
  }

  requestRender();

  return {
    faceCounts,
    setActivePart(part) {
      state.activePart = part;
      state.hovered = null;
      tooltip.hidden = true;
      requestRender();
    },
    destroy() {
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('wheel', wheel);
      canvas.removeEventListener('dblclick', reset);
      if (state.raf) cancelAnimationFrame(state.raf);
    }
  };
}

function buildContactFaces(faces, contacts) {
  const parts = ['fingers', 'thumb', 'palm'];
  const contactSets = Object.fromEntries(parts.map((part) => [part, new Set(contacts[part] || [])]));

  return faces.map((face, faceIndex) => {
    const counts = Object.fromEntries(parts.map((part) => [
      part,
      face.reduce((sum, vertexIndex) => sum + Number(contactSets[part].has(vertexIndex)), 0),
    ]));
    const maxCount = Math.max(...Object.values(counts));
    if (!maxCount) return null;

    const part = parts.find((name) => counts[name] === maxCount);
    return {
      faceIndex,
      part,
      coverage: maxCount / face.length,
      contactVertices: face.filter((vertexIndex) => contactSets[part].has(vertexIndex)),
    };
  });
}

function pointInTriangle(x, y, triangle) {
  const [a, b, c] = triangle;
  const denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  if (Math.abs(denominator) < 1e-8) return false;
  const alpha = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / denominator;
  const beta = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / denominator;
  const gamma = 1 - alpha - beta;
  return alpha >= 0 && beta >= 0 && gamma >= 0;
}

function updateContactHover(event, canvas, container, tooltip, state, requestRender) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  let nearest = null;

  for (const face of state.projectedFaces) {
    if (pointInTriangle(x, y, face.triangle) && (!nearest || face.depth > nearest.depth)) {
      nearest = face;
    }
  }

  const nextKey = nearest ? `${nearest.part}:${nearest.faceIndex}` : '';
  const currentKey = state.hovered ? `${state.hovered.part}:${state.hovered.faceIndex}` : '';
  if (nextKey === currentKey) return;
  state.hovered = nearest;

  if (nearest) {
    const containerRect = container.getBoundingClientRect();
    const coverage = Math.round(nearest.coverage * 100);
    const detail = nearest.pointCount
      ? `${nearest.pointCount} contact point${nearest.pointCount === 1 ? '' : 's'}`
      : `${coverage}% contact coverage`;
    tooltip.innerHTML = `<strong>${titleCase(nearest.part)}</strong><span>Face ${nearest.faceIndex + 1} · ${detail}</span>`;
    tooltip.style.left = `${event.clientX - containerRect.left + 12}px`;
    tooltip.style.top = `${event.clientY - containerRect.top + 12}px`;
    tooltip.hidden = false;
  } else {
    tooltip.hidden = true;
  }
  requestRender();
}

function renderContactCanvas(canvas, ctx, vertices, faces, groups, vertexColors, vertexColorPalette, contactFaces, state) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const cssWidth = Math.max(320, Math.floor(rect.width || canvas.parentElement.clientWidth || 620));
  const cssHeight = Math.max(360, Math.floor(rect.height || 520));
  const pixelWidth = Math.floor(cssWidth * dpr);
  const pixelHeight = Math.floor(cssHeight * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const gradient = ctx.createRadialGradient(cssWidth * 0.52, cssHeight * 0.44, 20, cssWidth * 0.5, cssHeight * 0.5, cssHeight * 0.72);
  gradient.addColorStop(0, '#1b242a');
  gradient.addColorStop(1, '#080b0e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  drawContactGrid(ctx, cssWidth, cssHeight);

  const transformed = vertices.map((vertex) => rotateVertex(vertex, state.rotX, state.rotY));
  const scale = Math.min(cssWidth, cssHeight) * 1.65 * state.zoom;
  const cameraZ = 2.2;
  const focal = 1.55;
  const screen = transformed.map(([x, y, z]) => {
    const depth = Math.max(0.12, cameraZ - z * state.zoom);
    const perspective = focal / depth;
    return [cssWidth / 2 + x * scale * perspective, cssHeight / 2 - y * scale * perspective, z];
  });

  const drawFaces = [];
  for (let index = 0; index < faces.length; index++) {
    const [ia, ib, ic] = faces[index];
    const a = transformed[ia];
    const b = transformed[ib];
    const c = transformed[ic];
    if (!a || !b || !c) continue;
    const normal = faceNormal(a, b, c);
    const visible = normal[2] > -0.18;
    drawFaces.push({
      index,
      depth: (screen[ia][2] + screen[ib][2] + screen[ic][2]) / 3,
      shade: faceShade(normal, visible),
      visible,
      contact: contactFaces[index],
    });
  }
  drawFaces.sort((a, b) => a.depth - b.depth);
  state.projectedFaces = [];

  ctx.lineJoin = 'round';
  for (const item of drawFaces) {
    const face = faces[item.index];
    const p0 = screen[face[0]];
    const p1 = screen[face[1]];
    const p2 = screen[face[2]];
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.closePath();
    const contactActive = item.contact && (state.activePart === 'all' || state.activePart === item.contact.part);
    const baseColor = contactActive
      ? contactRegionColor(item.contact.part)
      : CONTACT_NEUTRAL_COLOR;
    const contactBoost = contactActive ? 0.78 + item.contact.coverage * 0.36 : 1;
    ctx.fillStyle = shadeColor(baseColor, item.shade * contactBoost, item.visible ? 0.96 : 0.2);
    ctx.fill();
    const hovered = state.hovered?.faceIndex === item.index;
    ctx.strokeStyle = hovered
      ? 'rgba(255,255,255,0.98)'
      : contactActive
        ? 'rgba(8,11,13,0.42)'
        : item.visible ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.018)';
    ctx.lineWidth = hovered ? 2.4 : contactActive ? 0.8 : 0.45;
    ctx.stroke();

    if (contactActive && item.visible) {
      state.projectedFaces.push({
        ...item.contact,
        depth: item.depth,
        triangle: [p0, p1, p2],
      });
    }
  }

  ctx.save();
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.76)';
  const visibleLabel = state.activePart === 'all' ? 'all regions' : state.activePart;
  ctx.fillText(`${state.projectedFaces.length} visible contact faces · ${visibleLabel}`, 14, cssHeight - 16);
  ctx.restore();
}

function drawContactGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(103, 229, 189, 0.055)';
  ctx.lineWidth = 1;
  const spacing = 36;
  for (let x = spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function createOBJCanvasViewer(container, mesh, label, kind) {
  const canvas = document.createElement('canvas');
  canvas.className = 'obj-canvas-viewer';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${label} interactive OBJ mesh viewer`);
  container.appendChild(canvas);

  const controls = document.createElement('div');
  controls.className = 'mesh-controls';
  controls.textContent = 'Drag rotate · wheel zoom · double-click reset';
  container.appendChild(controls);

  const ctx = canvas.getContext('2d');
  const normalizedVertices = normalizeVertices(mesh.vertices);
  const normalized = kind === 'hand'
    ? orientHandPalmForward(normalizedVertices, mesh.faces)
    : normalizedVertices;
  const palette = meshPalette(kind);
  const vertexColorPalette = buildVertexColorPalette(mesh.vertexColors, palette);
  const initialRotation = kind === 'hand'
    ? { rotX: 0, rotY: 0 }
    : { rotX: -0.55, rotY: 0.72 };
  const state = {
    ...initialRotation,
    zoom: 1.0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    raf: null,
  };

  const resizeObserver = new ResizeObserver(() => requestRender());
  resizeObserver.observe(container);

  const pointerDown = (event) => {
    state.dragging = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };
  const pointerMove = (event) => {
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.rotY += dx * 0.012;
    state.rotX += dy * 0.012;
    state.rotX = clamp(state.rotX, -Math.PI * 0.95, Math.PI * 0.95);
    requestRender();
  };
  const pointerUp = (event) => {
    state.dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  const wheel = (event) => {
    event.preventDefault();
    state.zoom *= Math.exp(-event.deltaY * 0.0012);
    state.zoom = clamp(state.zoom, 0.25, 5);
    requestRender();
  };
  const reset = () => {
    state.rotX = initialRotation.rotX;
    state.rotY = initialRotation.rotY;
    state.zoom = 1.0;
    requestRender();
  };

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('wheel', wheel, { passive: false });
  canvas.addEventListener('dblclick', reset);

  function requestRender() {
    if (state.raf) return;
    state.raf = requestAnimationFrame(() => {
      state.raf = null;
      renderOBJCanvas(canvas, ctx, normalized, mesh.faces, mesh.groups, mesh.vertexColors, palette, vertexColorPalette, state);
    });
  }

  requestRender();

  return {
    destroy() {
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('wheel', wheel);
      canvas.removeEventListener('dblclick', reset);
      if (state.raf) cancelAnimationFrame(state.raf);
    }
  };
}

export function normalizeVertices(vertices) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const v of vertices) {
    for (let i = 0; i < 3; i++) {
      if (v[i] < min[i]) min[i] = v[i];
      if (v[i] > max[i]) max[i] = v[i];
    }
  }
  const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const span = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) || 1;
  return vertices.map(([x, y, z]) => [(x - center[0]) / span, (y - center[1]) / span, (z - center[2]) / span]);
}

function orientHandPalmForward(vertices, faces) {
  if (vertices.length < 778) return vertices;

  const palmIndices = [...MANO_PALM_REFERENCE_VERTICES].filter((index) => vertices[index]);
  const fingertipIndices = MANO_FINGERTIP_INDICES.filter((index) => vertices[index]);
  if (!palmIndices.length || fingertipIndices.length !== MANO_FINGERTIP_INDICES.length) return vertices;

  const palmNormals = [];
  for (const face of faces) {
    if (face.reduce((count, index) => count + Number(MANO_PALM_REFERENCE_VERTICES.has(index)), 0) < 2) continue;
    const [a, b, c] = face.map((index) => vertices[index]);
    if (!a || !b || !c) continue;
    palmNormals.push(faceNormal(a, b, c));
  }
  if (!palmNormals.length) return vertices;

  const palmNormal = normalize3(palmNormals.reduce(
    (sum, normal) => [sum[0] + normal[0], sum[1] + normal[1], sum[2] + normal[2]],
    [0, 0, 0],
  ));
  const palmCenter = averageVertices(vertices, palmIndices);
  const fingertipCenter = averageVertices(vertices, fingertipIndices);
  const fingerDirection = [
    fingertipCenter[0] - palmCenter[0],
    fingertipCenter[1] - palmCenter[1],
    fingertipCenter[2] - palmCenter[2],
  ];
  const normalProjection = dot3(fingerDirection, palmNormal);
  const palmUp = normalize3([
    fingerDirection[0] - palmNormal[0] * normalProjection,
    fingerDirection[1] - palmNormal[1] * normalProjection,
    fingerDirection[2] - palmNormal[2] * normalProjection,
  ]);
  const palmRight = normalize3(cross3(palmUp, palmNormal));
  const orthogonalUp = normalize3(cross3(palmNormal, palmRight));

  return vertices.map((vertex) => [
    dot3(vertex, palmRight),
    dot3(vertex, orthogonalUp),
    dot3(vertex, palmNormal),
  ]);
}

function averageVertices(vertices, indices) {
  const sum = indices.reduce((total, index) => [
    total[0] + vertices[index][0],
    total[1] + vertices[index][1],
    total[2] + vertices[index][2],
  ], [0, 0, 0]);
  return sum.map((value) => value / indices.length);
}

function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function renderOBJCanvas(canvas, ctx, vertices, faces, groups, vertexColors, palette, vertexColorPalette, state) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const cssWidth = Math.max(320, Math.floor(rect.width || canvas.parentElement.clientWidth || 420));
  const cssHeight = Math.max(280, Math.floor(rect.height || 300));
  const pixelWidth = Math.floor(cssWidth * dpr);
  const pixelHeight = Math.floor(cssHeight * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const gradient = ctx.createLinearGradient(0, 0, 0, cssHeight);
  gradient.addColorStop(0, '#11161d');
  gradient.addColorStop(1, '#07090d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const transformed = vertices.map((v) => rotateVertex(v, state.rotX, state.rotY));
  const scale = Math.min(cssWidth, cssHeight) * 1.38 * state.zoom;
  const cameraZ = 2.15;
  const focal = 1.55;
  const screen = transformed.map(([x, y, z]) => {
    const depth = Math.max(0.12, cameraZ - z * state.zoom);
    const p = focal / depth;
    return [cssWidth / 2 + x * scale * p, cssHeight / 2 - y * scale * p, z];
  });

  const drawFaces = [];
  for (let i = 0; i < faces.length; i++) {
    const [ia, ib, ic] = faces[i];
    const a = transformed[ia];
    const b = transformed[ib];
    const c = transformed[ic];
    if (!a || !b || !c) continue;
    const normal = faceNormal(a, b, c);
    // The camera looks down the negative z axis. Keep back faces faint rather than discarding
    // them so thin or open meshes remain inspectable from every angle.
    const visible = normal[2] > -0.18;
    const depth = (screen[ia][2] + screen[ib][2] + screen[ic][2]) / 3;
    const shade = faceShade(normal, visible);
    drawFaces.push({ i, depth, shade, visible });
  }
  drawFaces.sort((a, b) => a.depth - b.depth);

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const item of drawFaces) {
    const face = faces[item.i];
    const p0 = screen[face[0]];
    const p1 = screen[face[1]];
    const p2 = screen[face[2]];
    if (!p0 || !p1 || !p2) continue;

    const color = chooseMeshColor(palette, groups[item.i], item.i, faces.length, face, vertexColors, vertexColorPalette);
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, item.shade, item.visible ? 0.92 : 0.18);
    ctx.fill();

    if (faces.length < 12000) {
      ctx.strokeStyle = item.visible ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 0.45;
      ctx.stroke();
    }
  }

  drawHUD(ctx, cssWidth, cssHeight, faces.length, vertices.length, state.zoom);
}

function rotateVertex([x, y, z], rotX, rotY) {
  const cy = Math.cos(rotY);
  const sy = Math.sin(rotY);
  const cx = Math.cos(rotX);
  const sx = Math.sin(rotX);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  return [x1, y1, z2];
}

function faceNormal(a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}

function faceShade(normal, visible) {
  const light = normalize3([0.25, 0.42, 0.86]);
  const dot = Math.max(0, normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2]);
  return visible ? 0.42 + dot * 0.64 : 0.24;
}

function normalize3(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function meshPalette(kind) {
  if (kind === 'hand') return ['#f07045'];
  if (kind === 'object') return ['#48a9c5'];
  return ['#f07045', '#48a9c5'];
}

export function buildVertexColorPalette(vertexColors, palette) {
  if (palette.length < 2) return null;
  const keys = [];
  for (const color of vertexColors || []) {
    const key = vertexColorKey(color);
    if (key && !keys.includes(key)) keys.push(key);
    if (keys.length > palette.length) return null;
  }
  if (keys.length !== palette.length) return null;
  return new Map(keys.map((key, index) => [key, palette[index]]));
}

function vertexColorKey(color) {
  if (!color?.every(Number.isFinite)) return null;
  return color.map((value) => Math.round(clamp(value, 0, 1) * 255)).join(',');
}

function chooseMeshColor(palette, group, index, total, face, vertexColors, vertexColorPalette) {
  if (palette.length === 1) return palette[0];
  if (vertexColorPalette) {
    const counts = new Map();
    for (const vertexIndex of face) {
      const key = vertexColorKey(vertexColors[vertexIndex]);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    }
    const component = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (component && vertexColorPalette.has(component)) return vertexColorPalette.get(component);
  }
  const groupName = String(group || '').toLowerCase();
  if (groupName.includes('hand')) return palette[0];
  if (groupName.includes('obj') || groupName.includes('object')) return palette[1];
  return index < total * 0.28 ? palette[0] : palette[1];
}

function shadeColor(hex, intensity, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const rr = clamp(Math.round(r * intensity), 0, 255);
  const gg = clamp(Math.round(g * intensity), 0, 255);
  const bb = clamp(Math.round(b * intensity), 0, 255);
  return `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function drawHUD(ctx, width, height, faceCount, vertexCount, zoom) {
  ctx.save();
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.fillText(`${vertexCount.toLocaleString()} vertices · ${faceCount.toLocaleString()} faces · ${zoom.toFixed(1)}×`, 14, height - 16);
  ctx.restore();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function inferCategory(name) {
  const low = name.toLowerCase();
  for (const [cat] of PAPER_COUNTS) {
    const re = new RegExp(`(^|[_\\-\\s/])${cat}($|[_\\-\\s/.])`);
    if (re.test(low)) return cat;
  }
  return 'unknown';
}

function inferHand(name) {
  const low = name.toLowerCase();
  if (/(^|[_\-\s/])left($|[_\-\s/.])/.test(low)) return 'left';
  if (/(^|[_\-\s/])right($|[_\-\s/.])/.test(low)) return 'right';
  if (/(^|[_\-\s/])(both|bimanual)($|[_\-\s/.])/.test(low)) return 'both';
  return 'unknown';
}

function titleCase(value) {
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, '&#96;');
}
