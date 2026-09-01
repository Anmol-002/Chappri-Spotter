// The reporting loop: arm pin → drop pin → pick category → intensity → submit.
import { CATEGORIES, INTENSITY } from './data.js';
import { armPin, clearPin, focusCoords, popCharacter, renderMap } from './map.js';
import { activeCategories, bandFor, distanceKm, nearestTerritory, state, submitReport, vibeScore } from './state.js';
import { $, celebrate, el, shake, toast } from './ui.js';

const dialog = () => $('#reportDialog');
let draft = null;
let hooks = {};
let preserveNextPinCancel = false;

export function setupReport(callbacks) {
  hooks = callbacks;
}

export function beginReport() {
  clearPin();
  armPin();
  $('#pinBanner').classList.remove('hidden');
}

/** Let the header offer a fast GPS report without hiding the map-pin flow. */
export function chooseReportLocation(currentCoords) {
  clearPin();
  $('#pinBanner').classList.add('hidden');
  const hasLocation = Array.isArray(currentCoords) && currentCoords.length === 2;
  const body = $('#reportBody');
  body.innerHTML = `
    <div class="eyebrow">FIELD AGENT SUBMISSION · STEP 1</div>
    <h2>Where did you spot it?</h2>
    <p class="muted">Use your current location for a quick report, or drop a pin somewhere else. We score places, never people.</p>
    <div class="report-location-choice">
      <button class="submit" id="reportCurrent" ${hasLocation ? '' : 'disabled'}>
        📍 REPORT MY CURRENT LOCATION
        <small>${hasLocation ? 'Log it exactly where you are standing.' : 'Tap MY LOCATION first so we can find you.'}</small>
      </button>
      <button class="ghost-wide" id="reportElsewhere">
        🗺️ PICK ANOTHER PLACE
        <small>Drop and drag a pin anywhere on the map.</small>
      </button>
    </div>
  `;
  dialog().showModal();

  $('#reportCurrent')?.addEventListener('click', () => {
    if (!hasLocation) return;
    draft = { coords: [...currentCoords], categoryId: null, intensity: 3, note: '', scan: null, placeName: '' };
    renderForm();
  });
  $('#reportElsewhere')?.addEventListener('click', () => {
    // The dialog's close listener normally clears pin mode. Preserve this
    // freshly armed one while it performs old-dialog cleanup.
    preserveNextPinCancel = true;
    beginReport();
    dialog().close();
    hooks.onPickElsewhere?.();
  });
}

export function cancelPin() {
  if (preserveNextPinCancel) {
    preserveNextPinCancel = false;
    return;
  }
  clearPin();
  $('#pinBanner').classList.add('hidden');
}

export function onPinPlaced(coords) {
  $('#pinBanner').classList.add('hidden');
  draft = { coords, categoryId: null, intensity: 3, note: '', scan: null, placeName: '' };
  renderForm();
  dialog().showModal();
}

export function onPinMoved(coords) {
  if (!draft) return;
  draft.coords = coords;
  const strip = $('#locStrip');
  if (strip) strip.replaceWith(locationStrip());
}

function locationStrip() {
  const near = nearestTerritory(draft.coords);
  const km = near ? distanceKm(draft.coords, near.territory.coords) : 99;
  if (near?.inRadius) {
    const score = vibeScore(near.territory);
    return el(`<div class="loc-strip" id="locStrip">
        <b>📍 ${Math.round(km * 1000)}m from ${near.territory.name.toUpperCase()}</b>
        <span>${near.territory.zone} · catchment ${Math.round(near.radius * 1000)}m · VIBE ${score} · ${bandFor(score).icon} ${bandFor(score).label}</span>
      </div>`);
  }
  return el(`<div class="loc-strip new" id="locStrip">
      <b>🗺️ UNCHARTED COORDINATES</b>
      <span>No known sector within ${near ? Math.round(near.radius * 1000) : 550}m. Name this spot and it joins the network.</span>
      <input id="placeName" maxlength="28" placeholder="e.g. Rohini Sector 7 Market" value="${draft.placeName || ''}" />
    </div>`);
}

function renderForm() {
  const cats = activeCategories();
  const groups = [...new Set(cats.map((c) => c.group))];
  const isNsfw = Boolean(state.ui.nsfw);
  const body = $('#reportBody');

  body.innerHTML = `
    <div class="eyebrow">${isNsfw ? '🔞 18+ AFTER DARK SUBMISSION · RAW' : 'FIELD AGENT SUBMISSION · CLASSIFIED'}</div>
    <h2>Log a sighting</h2>
    <div id="locSlot"></div>
    <div class="field-label">1 · WHAT DID YOU SEE</div>
    <div class="cat-grid" id="catGrid">
      ${groups
        .map(
          (g) => `<div class="cat-group ${g.includes('18+') ? 'nsfw-group' : ''}">
            <h4>${g} ${g.includes('18+') ? '🔥' : ''}</h4>
            <div class="chips">
              ${cats
                .filter((c) => c.group === g)
                .map((c) => `<button type="button" class="chip ${c.nsfw ? 'nsfw-chip' : ''}" data-id="${c.id}">${c.emoji} ${c.label}</button>`)
                .join('')}
            </div>
          </div>`,
        )
        .join('')}
    </div>
    <div class="field-label">2 · INTENSITY</div>
    <div class="intensity" id="intensity">
      ${INTENSITY.map((i) => `<button type="button" class="int-btn ${i.level === 3 ? 'on' : ''}" data-level="${i.level}"><b>${i.level}</b><span>${i.label}</span></button>`).join('')}
    </div>
    <p class="int-note" id="intNote">“${INTENSITY[2].note}”</p>
    <div class="field-label">3 · FIELD NOTE <em>optional</em></div>
    <textarea id="note" maxlength="140" placeholder="${isNsfw ? 'Describe the scandalous vibe / gossip / scene...' : 'Describe the location energy — never anyone identity.'}"></textarea>
    <button class="submit" id="submitReport">SUBMIT TO VIBE NETWORK →</button>
    <p class="fineprint">Satire only. Score locations, not people. Reports mentioning individuals get quietly binned by the Aunty Moderation Layer.</p>
  `;

  $('#locSlot').replaceWith(locationStrip());

  $('#catGrid').onclick = (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $('#catGrid')
      .querySelectorAll('.chip')
      .forEach((c) => c.classList.toggle('on', c === chip));
    draft.categoryId = chip.dataset.id;
  };

  $('#intensity').onclick = (e) => {
    const btn = e.target.closest('.int-btn');
    if (!btn) return;
    draft.intensity = +btn.dataset.level;
    $('#intensity')
      .querySelectorAll('.int-btn')
      .forEach((b) => b.classList.toggle('on', b === btn));
    $('#intNote').textContent = `“${INTENSITY[draft.intensity - 1].note}”`;
  };

  $('#submitReport').onclick = finish;
}

/* ---------- submit + payoff ---------- */

function countUp(node, from, to) {
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 900);
    node.textContent = Math.round(from + (to - from) * p);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function finish() {
  if (!draft.categoryId) {
    shake($('#catGrid'));
    toast({ icon: '🤨', title: 'PICK A CATEGORY', body: 'The network cannot classify vibes on its own. Yet.' });
    return;
  }
  draft.note = $('#note').value;
  const nameInput = $('#placeName');
  if (nameInput) draft.placeName = nameInput.value;

  const result = submitReport(draft);
  const cat = CATEGORIES.find((c) => c.id === draft.categoryId);
  clearPin();
  renderMap();
  focusCoords(result.sighting.coords, 13);
  setTimeout(() => popCharacter(result.territory.id, `${cat.emoji} ${cat.label.toUpperCase()}!`), 500);

  const statDelta = result.statAfter - result.statBefore;
  const overallDelta = result.after - result.before;
  $('#reportBody').innerHTML = `
    <div class="eyebrow">TRANSMISSION COMPLETE</div>
    <h2 class="accepted">REPORT ACCEPTED</h2>
    <p class="muted">Your contribution has been added to the Vibe Intelligence Network™.</p>
    <div class="result-score">
      <div>
        <small>${result.territory.name.toUpperCase()} · ${cat.label.toUpperCase()} INDEX</small>
        <b><span id="resultNum">${result.statBefore}</span><i>/100</i></b>
        <span class="delta up">▲ ${statDelta} from your report</span>
        <p class="overall">OVERALL VIBE INDEX ${result.before} → <b>${result.after}</b> ${overallDelta ? `(${overallDelta > 0 ? '+' : ''}${overallDelta})` : ''}</p>
      </div>
      <div class="result-band" style="border-color:${result.afterBand.color};color:${result.afterBand.color}">
        ${result.afterBand.icon}<b>${result.afterBand.label}</b><span>${result.afterBand.note}</span>
      </div>
    </div>
    ${result.beforeBand.label !== result.afterBand.label ? `<p class="escalation">⚠️ RECLASSIFIED: ${result.beforeBand.label} → ${result.afterBand.label}</p>` : ''}
    ${result.discovered ? '<p class="escalation">🗺️ NEW SECTOR REGISTERED. You are its first witness.</p>' : ''}
    <div class="reward-row">
      <span>+${result.xp} XP</span>
      ${result.combo > 1 ? `<span class="combo">COMBO x${result.combo} — AUNTY IS IMPRESSED</span>` : ''}
      <span>${result.territory.reports} total sightings here</span>
    </div>
    <div class="result-actions">
      <button class="submit" id="againBtn">LOG ANOTHER SIGHTING</button>
      <button class="ghost-wide" id="beefBtn">🥊 START BEEF WITH A NEIGHBOUR</button>
      <button class="ghost-wide" id="shareBtn">📤 GENERATE SHARE CARD</button>
    </div>
  `;
  countUp($('#resultNum'), result.statBefore, result.statAfter);
  $('#againBtn').onclick = () => {
    dialog().close();
    beginReport();
  };
  $('#beefBtn').onclick = () => {
    dialog().close();
    hooks.onWantBattle?.(result.territory.id);
  };
  $('#shareBtn').onclick = () => hooks.onWantShare?.(result.territory.id);

  celebrate(result.levelUp, result.unlocked);
  hooks.onReported?.(result);
}
