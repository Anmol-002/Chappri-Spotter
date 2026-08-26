// Single source of truth. Everything on screen is derived from here, so a report
// immediately and visibly changes scores, bands, characters and rankings.
import { ACHIEVEMENTS, BANDS, CATEGORIES, CHARACTER_FOR_STAT, EXTRA_LINKS, LEVELS, NSFW_LAYERS, SFW_CATEGORIES, SFW_LAYERS, STATS } from './data.js';
import { applySharedEvent, mergeStarterWorld, sanitizeSighting, seedWorld } from './world.js';

const KEY = 'chappri-spotter-v4';
const NEIGHBOUR_RADIUS_KM = 11;
const MAX_NEIGHBOURS = 5;
const COMBO_WINDOW_MS = 3 * 60 * 1000;

const listeners = new Set();

export const state = {
  territories: [],
  sightings: [],
  battles: [],
  agent: { xp: 0, reports: 0, confirms: 0, battles: 0, scans: 0, combo: 0, lastReportAt: 0, achievements: [], byStat: {}, voted: {}, postedIds: [], voterId: '' },
  ui: { layer: 'chaos', selected: null, seenBriefing: false, layerLeader: null, nsfw: false, soundMuted: false },
  _voters: {},
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(detail = {}) {
  save();
  listeners.forEach((fn) => fn(detail));
}

function decorateSightings(sightings) {
  const posted = new Set(state.agent.postedIds || []);
  return (sightings || []).map((s) => ({
    ...s,
    mine: posted.has(s.id) || Boolean(s.mine),
  }));
}

export function voterId() {
  if (!state.agent.voterId) {
    state.agent.voterId = `v${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    save();
  }
  return state.agent.voterId;
}

export function hasVoted(id) {
  return Boolean(state.agent.voted?.[id]);
}

export function load() {
  const fresh = seedWorld();
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    saved = null;
  }
  state.agent = { ...state.agent, ...(saved?.agent || {}) };
  state.agent.byStat = state.agent.byStat || {};
  state.agent.achievements = state.agent.achievements || [];
  state.agent.voted = state.agent.voted || {};
  state.agent.postedIds = state.agent.postedIds || [];
  if (saved?.sightings?.length) {
    saved.sightings.forEach((s) => {
      if (s.voted) state.agent.voted[s.id] = s.voted;
      if (s.mine && !state.agent.postedIds.includes(s.id)) state.agent.postedIds.push(s.id);
    });
  }
  const currentWorld = saved?.territories?.length ? mergeStarterWorld(saved) : fresh;
  state.territories = currentWorld.territories;
  state.sightings = decorateSightings(currentWorld.sightings);
  if (!saved?.sightings?.length) {
    state.territories.forEach((t) => {
      t.reports = state.sightings.filter((s) => s.territoryId === t.id).length;
    });
  }
  state.battles = saved?.battles || [];
  state.ui.seenBriefing = Boolean(saved?.ui?.seenBriefing);
  state.ui.layer = saved?.ui?.layer || 'chaos';
  state.ui.nsfw = Boolean(saved?.ui?.nsfw);
  state.ui.soundMuted = Boolean(saved?.ui?.soundMuted);
  if (state.ui.nsfw) {
    if (!NSFW_LAYERS.some((l) => l.key === state.ui.layer)) state.ui.layer = 'makeout';
  } else if (!SFW_LAYERS.some((l) => l.key === state.ui.layer)) {
    state.ui.layer = 'chaos';
  }
}

/** Pull in what another open tab wrote, without touching this tab's filter or selection. */
export function reloadData() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return;
  }
  if (!saved) return;
  const currentWorld = mergeStarterWorld(saved);
  state.territories = currentWorld.territories;
  state.sightings = decorateSightings(currentWorld.sightings);
  state.battles = saved.battles || state.battles;
}

function save() {
  const { territories, sightings, battles, agent } = state;
  const payload = {
    territories,
    sightings,
    battles,
    agent,
    ui: {
      seenBriefing: state.ui.seenBriefing,
      layer: state.ui.layer,
      nsfw: state.ui.nsfw,
      soundMuted: state.ui.soundMuted,
    },
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* storage full or blocked; the session still works in memory */
  }
}

export function resetAll() {
  localStorage.removeItem(KEY);
  location.reload();
}

export function applyRemoteWorld(world) {
  if (!world?.territories?.length) return;
  const currentWorld = mergeStarterWorld(world);
  state.territories = currentWorld.territories;
  state.sightings = decorateSightings(currentWorld.sightings);
  state.battles = currentWorld.battles;
  emit({ type: 'hydrate' });
}

export function applyRemoteEvent(event) {
  const world = {
    territories: state.territories,
    sightings: state.sightings,
    battles: state.battles,
    voters: state._voters,
  };
  const changed = applySharedEvent(world, event);
  state._voters = world.voters;
  if (!changed || event?.type === 'fight') return false;
  state.territories = world.territories;
  state.sightings = decorateSightings(world.sightings);
  state.battles = world.battles;
  emit({ type: event.type === 'vote' ? 'vote' : event.type === 'battle' ? 'battle' : 'report' });
  return true;
}

/* ---------- dynamic radius & distance derived values ---------- */

export const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

export function vibeScore(t) {
  const active = ['chaos', 'aura', 'baddie', 'reels', 'fashion', 'gym', 'traffic'];
  const mean = active.reduce((sum, k) => sum + (t.stats[k] || 0), 0) / active.length;
  return clamp(mean * 1.06 - (t.stats.npc || 0) * 0.14);
}

export function bandFor(score) {
  return [...BANDS].reverse().find((b) => score >= b.min) || BANDS[0];
}

export function dominantStat(t) {
  const counts = sightingStatCounts(t.id);
  const rankedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1] || (t.stats[b[0]] || 0) - (t.stats[a[0]] || 0));
  if (rankedCounts[0]?.[1] > 0) return rankedCounts[0][0];
  const ranked = Object.keys(CHARACTER_FOR_STAT)
    .map((k) => ({ k, v: t.stats[k] || 0 }))
    .sort((a, b) => b.v - a.v);
  return ranked[0].k;
}

export function characterFor(t) {
  if (vibeScore(t) < 32 && !Object.values(sightingStatCounts(t.id)).some((n) => n > 1)) return 'uncle';
  return CHARACTER_FOR_STAT[dominantStat(t)] || 'chapri';
}

export function characterForLayer(t, layer = state.ui.layer) {
  if (layer && layer !== 'chaos') return CHARACTER_FOR_STAT[layer] || characterFor(t);
  return characterFor(t);
}

/** How many live posts this area has in each index. Filters and mascots use this, not the baked opening score. */
export function sightingStatCounts(territoryId) {
  const counts = {};
  sightingsFor(territoryId).forEach((s) => {
    const cat = CATEGORIES.find((c) => c.id === s.categoryId);
    if (!cat) return;
    counts[cat.stat] = (counts[cat.stat] || 0) + 1;
  });
  return counts;
}

export function qualifiesForLayer(t, layer = state.ui.layer) {
  if (!layer || layer === 'chaos') return true;
  return (sightingStatCounts(t.id)[layer] || 0) > 0;
}

export function layerSightings(territoryId, layer = state.ui.layer) {
  return sightingsFor(territoryId).filter((s) => {
    if (!layer || layer === 'chaos') return true;
    const cat = CATEGORIES.find((c) => c.id === s.categoryId);
    return cat?.stat === layer;
  });
}

export function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const territoryById = (id) => state.territories.find((t) => t.id === id);

/** Tiny catchment that grows with real reports so a quiet sector cannot swallow a distant pin. */
export function dynamicTerritoryRadiusKm(t) {
  const reports = sightingsFor(t?.id).length || t?.reports || 0;
  return Math.min(1.6, 0.55 + reports * 0.08);
}

/** Heat blob size in metres: 2 posts stay ~180m. Ten posts still under 700m. */
export function heatRadiusMeters(incidentCount) {
  const n = Math.max(1, incidentCount || 1);
  return Math.min(700, 90 + (n - 1) * 55);
}

/** Adjacency: close-by territories only, symmetric, so battles can never be city-wide randomness. */
export function neighbourIds(id) {
  const self = territoryById(id);
  if (!self) return [];
  const near = (from) =>
    state.territories
      .filter((t) => t.id !== from.id)
      .map((t) => ({ id: t.id, km: distanceKm(from.coords, t.coords) }))
      .sort((a, b) => a.km - b.km);

  const ranked = near(self);
  const set = new Set(ranked.filter((n) => n.km <= NEIGHBOUR_RADIUS_KM).slice(0, MAX_NEIGHBOURS).map((n) => n.id));

  // Symmetry
  ranked.slice(0, MAX_NEIGHBOURS + 3).forEach((n) => {
    const back = near(territoryById(n.id)).filter((x) => x.km <= NEIGHBOUR_RADIUS_KM).slice(0, MAX_NEIGHBOURS);
    if (back.some((x) => x.id === id)) set.add(n.id);
  });

  EXTRA_LINKS.forEach(([a, b]) => {
    if (a === id && territoryById(b)) set.add(b);
    if (b === id && territoryById(a)) set.add(a);
  });

  if (!set.size && ranked.length) set.add(ranked[0].id);
  return [...set];
}

export function nearestTerritory(coords) {
  let best = null;
  state.territories.forEach((t) => {
    const km = distanceKm(coords, t.coords);
    const radius = dynamicTerritoryRadiusKm(t);
    if (!best || km < best.km) best = { territory: t, km, inRadius: km <= radius, radius };
  });
  return best;
}

/* ---------- active filtered items ---------- */

export function activeSightings() {
  if (state.ui.nsfw) {
    return state.sightings;
  }
  return state.sightings.filter((s) => !s.nsfw);
}

export function activeCategories() {
  if (state.ui.nsfw) {
    return CATEGORIES;
  }
  return SFW_CATEGORIES;
}

export function activeLayers() {
  if (state.ui.nsfw) {
    return NSFW_LAYERS;
  }
  return SFW_LAYERS;
}

export function sightingsFor(territoryId) {
  return activeSightings().filter((s) => s.territoryId === territoryId);
}

/* ---------- agent progression ---------- */

export function levelFor(xp) {
  const index = LEVELS.reduce((acc, l, i) => (xp >= l.min ? i : acc), 0);
  const next = LEVELS[index + 1];
  return { index, ...LEVELS[index], next, progress: next ? (xp - LEVELS[index].min) / (next.min - LEVELS[index].min) : 1 };
}

function addXp(amount) {
  const before = levelFor(state.agent.xp).index;
  state.agent.xp += amount;
  const after = levelFor(state.agent.xp).index;
  return after > before ? levelFor(state.agent.xp) : null;
}

function checkAchievements() {
  const a = state.agent;
  const has = (id) => a.achievements.includes(id);
  const won = [];
  const unlock = (id) => {
    if (has(id)) return;
    a.achievements.push(id);
    won.push(ACHIEVEMENTS.find((x) => x.id === id));
  };

  if (a.reports >= 1) unlock('first-blood');
  if ((a.byStat.reels || 0) >= 5) unlock('reel-hunter');
  if ((a.byStat.gym || 0) >= 5) unlock('protein-analyst');
  if ((a.byStat.aura || 0) >= 5) unlock('aura-detector');
  if (a.battles >= 3) unlock('fight-promoter');
  if (a.combo >= 4) unlock('combo-king');
  if (a.confirms >= 5) unlock('peer-review');
  if (a.scans >= 1) unlock('vision');
  if (a.discovered) unlock('territory-scout');
  if (a.hitFinalBoss) unlock('final-boss');
  if (state.ui.nsfw) unlock('nsfw-explorer');
  if (a.rouletteSpins >= 3) unlock('rizz-master');
  return won;
}

/* ---------- actions ---------- */

export function submitReport({ coords, categoryId, intensity, note, placeName, scan }) {
  const category = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const near = nearestTerritory(coords);
  let territory = near?.inRadius ? near.territory : null;
  let discovered = false;

  if (!territory) {
    territory = {
      id: `t${Date.now()}`,
      name: placeName?.trim() || 'Uncharted Spot',
      zone: 'FIELD-DISCOVERED',
      coords: [...coords],
      stats: STATS.reduce((acc, k) => ({ ...acc, [k]: k === 'npc' ? 40 : 28 }), {}),
      reports: 0,
    };
    state.territories.push(territory);
    discovered = true;
    state.agent.discovered = true;
  }

  const before = vibeScore(territory);
  const beforeBand = bandFor(before);
  const statBefore = territory.stats[category.stat] || 0;
  const weight = 3 + intensity * 3;
  territory.stats[category.stat] = clamp(statBefore + weight);
  if (category.stat !== 'npc') territory.stats.npc = clamp(territory.stats.npc - intensity * 0.8);
  territory.reports = (territory.reports || 0) + 1;
  const after = vibeScore(territory);
  const afterBand = bandFor(after);

  const now = Date.now();
  state.agent.combo = now - state.agent.lastReportAt < COMBO_WINDOW_MS ? state.agent.combo + 1 : 1;
  state.agent.lastReportAt = now;
  state.agent.reports += 1;
  state.agent.byStat[category.stat] = (state.agent.byStat[category.stat] || 0) + 1;
  if (after >= 90) state.agent.hitFinalBoss = true;

  const sighting = {
    id: `s${now}`,
    coords: [...coords],
    territoryId: territory.id,
    categoryId: category.id,
    intensity,
    note: note?.trim() || category.line,
    at: now,
    up: 0,
    down: 0,
    mine: true,
    nsfw: Boolean(category.nsfw),
    scan: scan || null,
  };
  state.sightings.unshift(sighting);
  state.agent.postedIds = [...(state.agent.postedIds || []), sighting.id].slice(-200);

  const comboBonus = Math.max(0, state.agent.combo - 1) * 4;
  const levelUp = addXp(10 + intensity * 4 + comboBonus + (discovered ? 25 : 0));
  const unlocked = checkAchievements();

  emit({ type: 'report', territory });
  return {
    territory,
    sighting,
    category,
    before,
    after,
    beforeBand,
    afterBand,
    statBefore,
    statAfter: territory.stats[category.stat],
    discovered,
    levelUp,
    unlocked,
    combo: state.agent.combo,
    xp: 10 + intensity * 4 + comboBonus + (discovered ? 25 : 0),
    sharedEvent: {
      type: 'report',
      sighting: sanitizeSighting(sighting),
      newTerritory: discovered
        ? { ...territory, stats: { ...territory.stats }, coords: [...territory.coords] }
        : null,
      stat: category.stat,
      statDelta: weight,
      npcDelta: category.stat !== 'npc' ? -intensity * 0.8 : 0,
    },
  };
}

export function voteSighting(id, dir) {
  const s = state.sightings.find((x) => x.id === id);
  if (!s || hasVoted(id)) return null;
  const me = voterId();
  state.agent.voted = { ...(state.agent.voted || {}), [id]: dir };
  state._voters[`${id}:${me}`] = dir;
  s[dir === 'up' ? 'up' : 'down'] += 1;
  const territory = territoryById(s.territoryId);
  const category = CATEGORIES.find((c) => c.id === s.categoryId);
  if (territory && category) {
    territory.stats[category.stat] = clamp(territory.stats[category.stat] + (dir === 'up' ? 2 : -3));
  }
  state.agent.confirms += dir === 'up' ? 1 : 0;
  const levelUp = addXp(dir === 'up' ? 5 : 3);
  const unlocked = checkAchievements();
  emit({ type: 'vote' });
  return {
    sighting: s,
    levelUp,
    unlocked,
    sharedEvent: { type: 'vote', sightingId: id, dir, voterId: me },
  };
}

export function recordBattle({ a, b, rounds, winner, vote }) {
  state.battles.unshift({ id: `b${Date.now()}`, at: Date.now(), a: a.id, b: b.id, aName: a.name, bName: b.name, winner: winner.id, winnerName: winner.name, rounds, vote });
  state.battles = state.battles.slice(0, 25);
  state.agent.battles += 1;

  const champ = territoryById(winner.id);
  if (champ) {
    rounds.filter((r) => r.winner === winner.id).forEach((r) => {
      champ.stats[r.stat] = clamp(champ.stats[r.stat] + 1);
    });
  }
  const levelUp = addXp(20);
  const unlocked = checkAchievements();
  emit({ type: 'battle' });
  return {
    levelUp,
    unlocked,
    sharedEvent: {
      type: 'battle',
      battle: {
        id: state.battles[0].id,
        at: state.battles[0].at,
        a: a.id,
        b: b.id,
        aName: a.name,
        bName: b.name,
        winner: winner.id,
        winnerName: winner.name,
        rounds,
        vote,
      },
    },
  };
}

export function recordRouletteSpin() {
  state.agent.rouletteSpins = (state.agent.rouletteSpins || 0) + 1;
  const unlocked = checkAchievements();
  emit({ type: 'spin' });
  return unlocked;
}

export function setLayer(key) {
  state.ui.layer = key;
  emit({ type: 'layer' });
}

export function setSelected(id) {
  state.ui.selected = id;
  emit({ type: 'select' });
}

export function setNsfwMode(enabled) {
  state.ui.nsfw = Boolean(enabled);
  const unlocked = checkAchievements();
  emit({ type: 'nsfw', enabled: state.ui.nsfw });
  return unlocked;
}

export function setSoundMuted(muted) {
  state.ui.soundMuted = Boolean(muted);
  emit({ type: 'sound', muted: state.ui.soundMuted });
}

export function markBriefingSeen() {
  state.ui.seenBriefing = true;
  save();
}

export function registerScan() {
  state.agent.scans += 1;
  const unlocked = checkAchievements();
  emit({ type: 'scan' });
  return unlocked;
}

export function cityThreat() {
  if (!state.territories.length) return 0;
  return clamp(state.territories.reduce((sum, t) => sum + vibeScore(t), 0) / state.territories.length);
}
