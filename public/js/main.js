import { NSFW_LAYERS, SFW_LAYERS } from './data.js';
import { alertIfEnteredZone, alertIfNearbySighting, alertIfScouting, getUserCoords, maybeRequestNotifications, readSavedGps, rememberPosition, setGpsLive } from './alerts.js';
import { openBattlePicker, setupBattles } from './battles.js';
import { playSound, setAfterDarkAmbience } from './combat.js';
import { animateFight, focusCoords, focusTerritory, geocodeSearch, initMap, invalidate, layerOptionsHtml, locateMe, openSightingPopup, popCharacter, renderMap, searchLocations, watchUserPosition, worldPlaceSearch } from './map.js';
import { hideDossier, openAreaPostsModal, renderDossier, renderLegend, renderSidebar, setupPanels, sightingCard } from './panels.js';
import { beginReport, cancelPin, onPinMoved, onPinPlaced, setupReport } from './report.js';
import { openShareCard } from './share.js';
import { hydrateSharedWorld, listenSharedEvents, pushSharedEvent } from './sync.js';
import { activeLayers, bandFor, cityThreat, levelFor, load, markBriefingSeen, recordBattle, reloadData, resetAll, setLayer, setNsfwMode, setSelected, setSoundMuted, state, subscribe, territoryById, vibeScore, voteSighting } from './state.js';
import { $, celebrate, toast, wireDialogClose } from './ui.js';

load();

// Sync initial UI states
document.body.classList.toggle('nsfw-mode', Boolean(state.ui.nsfw));
updateNsfwBtn();
updateSoundBtn();

/* ---------- map ---------- */

initMap({
  onTerritoryClick: (id) => {
    closeFeed();
    setSelected(id);
    popCharacter(id);
    if (window.innerWidth < 860) focusTerritory(id, 13);
    playSound('punch');
  },
  onClusterClick: (territoryId, items) => {
    closeFeed();
    if (territoryId) setSelected(territoryId);
    openAreaPostsModal(territoryId, items);
    playSound('slap');
  },
  onSightingClick: (id, marker) => {
    const s = state.sightings.find((x) => x.id === id);
    if (s) {
      openSightingPopup(marker, sightingCard(s));
      playSound('slap');
    }
  },
  onBlankClick: () => {
    setSelected(null);
    hideDossier();
    closeFeed();
    closeSearchResults();
  },
  onPinPlaced,
  onPinMoved,
});

function syncLayerDropdown() {
  const select = $('#layerSelect');
  if (!select) return;
  select.innerHTML = layerOptionsHtml();
  select.value = state.ui.layer;
}
syncLayerDropdown();

$('#layerSelect').onchange = (e) => {
  setLayer(e.target.value);
  hideDossier();
  const layer = activeLayers().find((l) => l.key === e.target.value);
  playSound(state.ui.nsfw ? 'sultry_whisper' : 'whoosh');
  toast({ icon: layer?.emoji || '🎯', title: `FILTER: ${layer?.label || e.target.value.toUpperCase()}`, body: 'Only areas with actual matching posts stay on the map.', ms: 2800 });
};

$('#locateButton').onclick = () => {
  const cached = getUserCoords() || readSavedGps();
  toast({
    icon: '📡',
    title: cached ? 'BRINGING YOU HOME…' : 'SCANNING GPS RADAR…',
    body: cached ? 'Snapping back to your last lock, then confirming live GPS.' : 'Finding you. Then watching the chaos around you.',
    ms: 2200,
  });
  locateMe(
    (coords, near) => {
      rememberPosition(coords);
      maybeRequestNotifications();
      watchUserPosition((next) => alertIfEnteredZone(next));
      setGpsLive(true, near?.inRadius ? near.territory.name : 'your vicinity');
      alertIfEnteredZone(coords, { force: true });
      if (near?.territory && near.inRadius) {
        setSelected(near.territory.id);
        renderDossier(near.territory.id);
      }
      playSound('punch');
    },
    () => toast({ icon: '🛑', title: 'GPS ACCESS DENIED / UNAVAILABLE', body: 'Turn on location for this site, or search Gurgaon / tap the map.' }),
    cached,
  );
};

$('#pinCancel').onclick = cancelPin;
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cancelPin();
    closeSearchResults();
    closeFeed();
  }
});

/* ---------- mobile live feed sheet ---------- */

function isFeedOpen() {
  return document.body.classList.contains('feed-open');
}

function setFeedOpen(open) {
  document.body.classList.toggle('feed-open', open);
  $('#feedToggle')?.setAttribute('aria-expanded', String(open));
  if (open) {
    hideDossier();
    closeSearchResults();
  }
}

function closeFeed() {
  setFeedOpen(false);
}

function openFeed() {
  setSelected(null);
  hideDossier();
  setFeedOpen(true);
}

function toggleFeed() {
  if (isFeedOpen()) closeFeed();
  else openFeed();
}

$('#feedToggle')?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFeed();
  playSound('whoosh');
});
$('#feedClose')?.addEventListener('click', () => closeFeed());
$('#feedScrim')?.addEventListener('click', () => closeFeed());

/* ---------- Location Search Bar ---------- */

const searchInput = $('#locationSearch');
const searchResults = $('#searchResults');
const searchClear = $('#searchClear');
let searchTimer = 0;
let searchAbort = null;
let searchToken = 0;

function closeSearchResults() {
  searchToken += 1;
  searchAbort?.abort();
  searchResults.classList.add('hidden');
}

function renderSearchHits(results, query, { loading = false } = {}) {
  if (!results.length && !loading) {
    searchResults.innerHTML = `<div class="search-empty">No places matched “${query}”. Try Bangalore, Koramangala, Cyber Hub…</div>`;
    searchResults.classList.remove('hidden');
    return;
  }
  const rows = results
    .map(
      (r) => `
      <div class="search-item" data-id="${r.id || ''}" data-lat="${r.coords[0]}" data-lng="${r.coords[1]}" data-type="${r.type}">
        <span class="search-item-icon">${r.type === 'landmark' ? '🏢' : r.type === 'geo' ? '🌍' : '📍'}</span>
        <div class="search-item-info">
          <b>${r.name.toUpperCase()}</b>
          <span>${r.zone}${r.vibe != null ? ` · VIBE ${r.vibe}` : ''}</span>
        </div>
        <em class="search-item-action">FLY →</em>
      </div>
    `,
    )
    .join('');
  searchResults.innerHTML = `${rows}${loading ? '<div class="search-empty">Searching the world…</div>' : ''}`;
  searchResults.classList.remove('hidden');
}

async function handleSearch(query) {
  if (!query || !query.trim()) {
    searchClear.classList.add('hidden');
    closeSearchResults();
    return;
  }
  searchClear.classList.remove('hidden');
  const token = ++searchToken;
  const local = [...searchLocations(query), ...worldPlaceSearch(query)];
  renderSearchHits(local, query, { loading: true });

  searchAbort?.abort();
  const ctrl = new AbortController();
  searchAbort = ctrl;
  try {
    const world = await geocodeSearch(query, { signal: ctrl.signal });
    if (token !== searchToken) return;
    const seen = new Set(local.map((r) => r.name.toLowerCase()));
    const extra = world.filter((r) => !seen.has(r.name.toLowerCase()));
    renderSearchHits([...local, ...extra].slice(0, 8), query);
  } catch (err) {
    if (err?.name === 'AbortError' || token !== searchToken) return;
    if (!local.length) renderSearchHits([], query);
    else renderSearchHits(local, query);
  }
}

searchInput?.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => handleSearch(e.target.value), 380);
});
searchInput?.addEventListener('focus', () => {
  if (window.innerWidth < 860) {
    hideDossier();
    closeFeed();
  }
  if (searchInput.value.trim()) handleSearch(searchInput.value);
});

searchClear?.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.add('hidden');
  closeSearchResults();
  searchInput.focus();
});

searchResults?.addEventListener('click', (e) => {
  const item = e.target.closest('.search-item');
  if (!item) return;

  const id = item.dataset.id;
  const lat = parseFloat(item.dataset.lat);
  const lng = parseFloat(item.dataset.lng);

  closeSearchResults();
  closeFeed();
  searchInput.value = item.querySelector('b')?.textContent || '';

  if (id && territoryById(id)) {
    setSelected(id);
    focusTerritory(id, 14);
    renderDossier(id);
    popCharacter(id);
    alertIfScouting(id);
  } else {
    const zoom = item.dataset.type === 'geo' ? 12 : 14;
    focusCoords([lat, lng], zoom);
    hideDossier();
    setSelected(null);
  }

  playSound('punch');
  toast({ icon: '📍', title: `FLYING THERE`, body: `Viewing ${searchInput.value}`, tone: 'good', ms: 2600 });
});

/* ---------- 18+ NSFW Mode Switch ---------- */

function updateNsfwBtn() {
  const btn = $('#nsfwToggle');
  if (!btn) return;
  if (state.ui.nsfw) {
    btn.classList.add('on');
    btn.innerHTML = `<span class="nsfw-icon">🔞</span><span class="nsfw-text">NSFW: ON</span>`;
  } else {
    btn.classList.remove('on');
    btn.innerHTML = `<span class="nsfw-icon">🔞</span><span class="nsfw-text">NSFW: OFF</span>`;
  }
}

$('#nsfwToggle')?.addEventListener('click', () => {
  const next = !state.ui.nsfw;
  const unlocked = setNsfwMode(next);
  document.body.classList.toggle('nsfw-mode', next);
  updateNsfwBtn();
  if (next) {
    if (!NSFW_LAYERS.some((l) => l.key === state.ui.layer)) setLayer('makeout');
  } else if (!SFW_LAYERS.some((l) => l.key === state.ui.layer)) {
    setLayer('chaos');
  }
  syncLayerDropdown();
  setAfterDarkAmbience(next);

  if (next) {
    playSound('sultry_whisper');
    toast({
      icon: '🔞',
      title: '18+ AFTER DARK MODE ACTIVATED',
      body: 'Makeout spots, people looking for casual, thirst traps, dirty tea and 2-hour specials unlocked.',
      tone: 'good',
      ms: 5000,
    });
  } else {
    playSound('punch');
    toast({
      icon: '😇',
      title: 'SFW MODE RESTORED',
      body: 'Standard satirical surveillance active.',
      ms: 3000,
    });
  }
  celebrate(null, unlocked);
  renderMap();
  renderAll();
});

/* ---------- Sound FX Toggle ---------- */

function updateSoundBtn() {
  const btn = $('#soundToggle');
  const icon = $('#soundIcon');
  if (!btn || !icon) return;
  if (state.ui.soundMuted) {
    icon.textContent = '🔇';
    btn.classList.add('muted');
  } else {
    icon.textContent = '🔊';
    btn.classList.remove('muted');
  }
}

$('#soundToggle')?.addEventListener('click', () => {
  const next = !state.ui.soundMuted;
  setSoundMuted(next);
  updateSoundBtn();
  if (!next) {
    playSound('punch');
    setAfterDarkAmbience(state.ui.nsfw);
    toast({ icon: '🔊', title: 'SOUND FX ENABLED', body: 'Punches, slaps, and after-dark bass are live.', tone: 'good', ms: 2500 });
  } else {
    setAfterDarkAmbience(false);
    toast({ icon: '🔇', title: 'SOUND FX MUTED', body: 'Surveillance audio silenced.', ms: 2500 });
  }
});

/* ---------- flows ---------- */

setupReport({
  onWantBattle: (id) => openBattlePicker(id),
  onWantShare: (id) => openShareCard(id),
  onReported: (result) => {
    setSelected(result.territory.id);
    renderDossier(result.territory.id);
    publish({
      type: 'report',
      territoryId: result.territory.id,
      category: result.category.id,
      intensity: result.sighting.intensity,
      coords: result.sighting.coords,
    });
    pushSharedEvent(result.sharedEvent);
  },
});

setupBattles({
  onStartFight: startFight,
});

setupPanels({
  onFocusTerritory: (id) => {
    closeFeed();
    setSelected(id);
    focusTerritory(id, window.innerWidth < 860 ? 13 : undefined);
    renderDossier(id);
  },
  onCloseDossier: () => {
    setSelected(null);
    hideDossier();
  },
  onReportHere: (id) => {
    const t = territoryById(id);
    closeFeed();
    hideDossier();
    beginReport();
    if (t) focusTerritory(id, 14);
    if (window.innerWidth >= 860) {
      toast({ icon: '📍', title: `PIN INSIDE ${t?.name.toUpperCase() || 'THE SECTOR'}`, body: 'Tap the exact spot — or tap the character to use its centre.', ms: 3600 });
    }
  },
  onBattleFrom: (id) => openBattlePicker(id),
  onVote: (id, dir) => {
    const res = voteSighting(id, dir);
    if (!res) return;
    pushSharedEvent(res.sharedEvent);
    toast({
      icon: dir === 'up' ? '🤝' : '🤔',
      title: dir === 'up' ? 'SIGHTING CONFIRMED' : 'DOUBT REGISTERED',
      body: dir === 'up' ? 'Index nudged upward. Agent credibility rewarded.' : 'The index has been quietly corrected.',
      tone: dir === 'up' ? 'good' : 'info',
    });
    playSound(dir === 'up' ? 'punch' : 'slap');
    celebrate(res.levelUp, res.unlocked);
  },
});

$('#reportButton').onclick = () => {
  closeFeed();
  hideDossier();
  beginReport();
  if (window.innerWidth >= 860) {
    toast({ icon: '📍', title: 'PIN MODE ARMED', body: 'Tap anywhere on the map to place your sighting.', ms: 3200 });
  }
};

$('#resetCity').onclick = () => {
  if (confirm('Wipe your XP, votes and local cache? Everyone else’s posts stay on the live map.')) resetAll();
};

/* ---------- live activity across open users/tabs ---------- */

const LIVE_KEY = 'chappri-live-fight';
const liveChannel = 'BroadcastChannel' in window ? new BroadcastChannel('chappri-live') : null;
const seenFights = new Set();

function publish(message) {
  liveChannel?.postMessage(message);
}

function startFight(fight) {
  const a = territoryById(fight.a);
  const b = territoryById(fight.b);
  const winner = territoryById(fight.winner);
  setSelected(null);
  hideDossier();
  closeFeed();
  const result = recordBattle({ a, b, rounds: fight.rounds, winner, vote: null });
  celebrate(result.levelUp, result.unlocked);
  pushSharedEvent(result.sharedEvent);
  const live = { ...fight, expiresAt: Date.now() + 8200 };
  seenFights.add(live.id);
  localStorage.setItem(LIVE_KEY, JSON.stringify(live));
  publish({ type: 'fight', fight: live });
  pushSharedEvent({ type: 'fight', fight: live });
  animateFight(live, {
    focus: true,
    compact: false,
    onDone: () => toast({ icon: state.ui.nsfw ? '💋' : '🏆', title: state.ui.nsfw ? 'THEY LEFT TOGETHER' : `${winner.name.toUpperCase()} WON`, body: state.ui.nsfw ? 'Chemistry overload. Group chat is coping.' : 'The loser has requested a recount.', tone: 'good' }),
  });
}

function observeFight(fight) {
  if (!fight || fight.expiresAt <= Date.now() || seenFights.has(fight.id)) return;
  seenFights.add(fight.id);
  animateFight(fight, { focus: false, compact: true });
  const a = territoryById(fight.a);
  const b = territoryById(fight.b);
  toast({
    icon: state.ui.nsfw ? '💋' : '🥊',
    title: state.ui.nsfw ? 'SITUATIONSHIP ON THE MAP' : 'LIVE BEEF ON THE MAP',
    body: `${a?.name} and ${b?.name} — small pin. Tap it to zoom in.`,
  });
}

const seenReports = new Set();

function noteIncomingReport(data) {
  const key = data.sightingId || `${data.territoryId}:${data.coords || ''}:${data.category || ''}`;
  if (seenReports.has(key)) return;
  seenReports.add(key);
  alertIfNearbySighting({
    territoryId: data.territoryId,
    category: data.category,
    intensity: data.intensity ?? 3,
    coords: data.coords,
    mine: false,
  });
}

liveChannel?.addEventListener('message', ({ data }) => {
  if (data.type === 'fight') observeFight(data.fight);
  if (data.type === 'report') {
    reloadData();
    renderMap();
    renderAll();
    noteIncomingReport(data);
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === LIVE_KEY && e.newValue) observeFight(JSON.parse(e.newValue));
});

/* ---------- ambient ticker (text only, never steals focus) ---------- */

function tickerLines() {
  const hottest = [...state.territories].sort((a, b) => vibeScore(b) - vibeScore(a))[0];
  const layer = activeLayers().find((l) => l.key === state.ui.layer);
  const leader = territoryById(state.ui.layerLeader);
  const lvl = levelFor(state.agent.xp);
  const nsfwLines = state.ui.nsfw
    ? [
        '🔞 AFTER DARK FEED LIVE: MAKEOUT SPOTS, CASUAL LOOKING, THIRST TRAPS',
        '💋 FOGGED-WINDOW WATCH: HAZARD LIGHTS MEAN THE WINDOWS ARE LYING',
        '🫦 PEOPLE ARE LOOKING FOR CASUAL. THEY WILL DENY THIS TOMORROW',
        '🏩 2-HOUR SPECIAL INDEX SPIKING NEAR NOIDA SECTOR 18',
      ]
    : [];

  return [
    `CITY THREAT LEVEL ${cityThreat()} — CONDITIONS ${bandFor(cityThreat()).label}`,
    ...nsfwLines,
    hottest ? `${hottest.name.toUpperCase()} IS CURRENTLY THE MOST CONCERNING PLACE IN NCR (${vibeScore(hottest)})` : '',
    leader ? `${layer?.unit.toUpperCase() || 'VIBE'} LEADER: ${leader.name.toUpperCase()} AT ${leader.stats[layer?.key || 'chaos'] || 0}` : '',
    `${state.sightings.length} FIELD REPORTS ON RECORD · ${state.territories.length} SECTORS MONITORED`,
    `YOUR CLEARANCE: ${lvl.name} · ${state.agent.xp} XP`,
    state.battles.length ? `LAST BEEF: ${state.battles[0].winnerName.toUpperCase()} BEAT ${(state.battles[0].winner === state.battles[0].a ? state.battles[0].bName : state.battles[0].aName).toUpperCase()}` : '',
    'REMINDER: WE SCORE LOCATIONS, NOT PEOPLE.',
  ].filter(Boolean);
}

let tickIndex = 0;
function rotateTicker() {
  const lines = tickerLines();
  tickIndex = (tickIndex + 1) % lines.length;
  const node = $('#tickerText');
  if (!node) return;
  node.style.opacity = 0;
  setTimeout(() => {
    node.textContent = lines[tickIndex];
    node.style.opacity = 1;
  }, 260);
}
setInterval(rotateTicker, 6500);
window.addEventListener('resize', invalidate);

/* ---------- briefing ---------- */

function openBriefing() {
  const ranked = [...state.territories].sort((a, b) => vibeScore(b) - vibeScore(a));
  $('#briefingList').innerHTML = ranked
    .slice(0, 3)
    .map((t) => `<li><b>${t.name.toUpperCase()}</b><span style="color:${bandFor(vibeScore(t)).color}">${vibeScore(t)} · ${bandFor(vibeScore(t)).label}</span></li>`)
    .join('');
  $('#briefingDialog').showModal();
}

$('#briefingStart').onclick = () => {
  $('#briefingDialog').close();
  markBriefingSeen();
};

/* ---------- reactive render ---------- */

function renderAll() {
  renderSidebar();
  renderLegend();
  if (state.ui.selected && !isFeedOpen()) renderDossier(state.ui.selected);
}

subscribe((detail) => {
  if (detail.type === 'layer' || detail.type === 'report' || detail.type === 'vote' || detail.type === 'battle' || detail.type === 'nsfw' || detail.type === 'select' || detail.type === 'hydrate') renderMap();
  renderAll();
});

['#reportDialog', '#battleDialog', '#shareDialog', '#areaPostsDialog', '#matchmakerDialog'].forEach((sel) => {
  const d = $(sel);
  if (d) wireDialogClose(d);
});
$('#reportDialog')?.addEventListener('close', cancelPin);

renderMap();
renderAll();
rotateTicker();
if (!state.ui.seenBriefing) openBriefing();

hydrateSharedWorld().catch(() => {
  /* offline / local file — keep whatever was already in this browser */
});
listenSharedEvents({
  onFight: observeFight,
  onWorldEvent: (event) => {
    if (event.type === 'report' && event.sighting) {
      noteIncomingReport({
        sightingId: event.sighting.id,
        territoryId: event.sighting.territoryId,
        category: event.sighting.categoryId,
        intensity: event.sighting.intensity,
        coords: event.sighting.coords,
      });
    }
  },
});
try {
  observeFight(JSON.parse(localStorage.getItem(LIVE_KEY) || 'null'));
} catch {
  localStorage.removeItem(LIVE_KEY);
}
