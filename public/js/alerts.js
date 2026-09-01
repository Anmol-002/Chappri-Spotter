// Nearby, enter-area, and "you're looking at this sector" alerts.
// Funny, rare, never a firehose — phone-in-pocket friendly.
import { speakCharacterLine } from './combat.js';
import { CATEGORIES } from './data.js';
import { bandFor, distanceKm, nearestTerritory, state, territoryById, vibeScore } from './state.js';
import { toast } from './ui.js';

const NEARBY_KM = 2.4;
const CITY_VOICE_KM = 14;
const GLOBAL_GAP_MS = 80 * 1000;
const PER_SPOT_GAP_MS = 6 * 60 * 1000;
const ZONE_GAP_MS = 8 * 60 * 1000;
const LAST_GPS_KEY = 'chappri-last-gps';

let userCoords = null;
let lastTerritoryId = null;
let lastGlobalAlertAt = 0;
const lastSpotAlertAt = new Map();
const lastZoneAlertAt = new Map();

export function getUserCoords() {
  return userCoords ? [...userCoords] : null;
}

export function readSavedGps() {
  try {
    const raw = sessionStorage.getItem(LAST_GPS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length === 2) return parsed;
  } catch {
    /* private mode */
  }
  return null;
}

export function rememberPosition(coords) {
  if (!coords) return;
  userCoords = [...coords];
  try {
    sessionStorage.setItem(LAST_GPS_KEY, JSON.stringify(userCoords));
  } catch {
    /* ignore */
  }
}

export function maybeRequestNotifications() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'default') return;
  Notification.requestPermission().catch(() => {});
}

function systemNotify(title, body, tag) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, { body, tag, silent: true });
    setTimeout(() => n.close(), 7000);
  } catch {
    /* Safari private / unsupported */
  }
}

function ping({ icon, title, body, tag, tone = 'alert' }) {
  toast({ icon, title, body, tone, ms: 5600 });
  systemNotify(title, body, tag);
}

function tooSoon(map, key, gap) {
  const prev = map.get(key) || 0;
  if (Date.now() - prev < gap) return true;
  map.set(key, Date.now());
  return false;
}

function flavorFor(t) {
  const score = vibeScore(t);
  const s = t.stats || {};
  const nsfw = Boolean(state.ui.nsfw);
  const lanes = [
    { n: s.baddie || 0, icon: '💅', title: `BADDIES AHEAD: ${t.name.toUpperCase()}`, body: 'Neck on a swivel. Someone just walked in like the song was written about them.' },
    { n: s.chaos || 0, icon: '💀', title: `TOO MUCH CHAPPRI: ${t.name.toUpperCase()}`, body: 'Tripods have right of way. Dignity is in the glovebox. Be safe, soldier.' },
    { n: s.reels || 0, icon: '🎥', title: `REEL OUTBREAK: ${t.name.toUpperCase()}`, body: 'Do not make eye contact with a ring light. You will be in take 41.' },
    { n: s.traffic || 0, icon: '🚗', title: `HORN ZONE: ${t.name.toUpperCase()}`, body: 'Your eardrums have left the chat. Wrong-side is a personality here.' },
    { n: s.gym || 0, icon: '💪', title: `PROTEIN FRONTAL SYSTEM: ${t.name.toUpperCase()}`, body: 'Lat spread advisory. Shaker bottles have diplomatic immunity.' },
    { n: nsfw ? s.makeout || 0 : 0, icon: '💋', title: `FOGGED-WINDOW DISTRICT: ${t.name.toUpperCase()}`, body: 'Hazard lights mean mind your business. Or don’t. After Dark is watching.' },
    { n: nsfw ? s.hookup || 0 : 0, icon: '🫦', title: `PEOPLE LOOKING: ${t.name.toUpperCase()}`, body: 'Bios say “nothing serious.” Eyes say otherwise. Walk like you live here.' },
  ].sort((a, b) => b.n - a.n);

  if (score >= 81) {
    return {
      icon: '☢️',
      title: `⚠️ CHAPPRI-PRONE: ${t.name.toUpperCase()}`,
      body: `Vibe ${score}. Be safe. Main-character energy is contagious. Do not engage the tripod.`,
    };
  }
  if (lanes[0].n >= 55) return lanes[0];
  const band = bandFor(score);
  return {
    icon: band.icon,
    title: `ENTERING ${t.name.toUpperCase()}`,
    body: `${band.label}. Vibe ${score}. Walk like you belong. The city is taking notes.`,
  };
}

function briefTerritory(t, { tagPrefix, force = false, voice = true } = {}) {
  if (!t) return false;
  if (!force && tooSoon(lastZoneAlertAt, t.id, ZONE_GAP_MS)) return false;
  if (force) lastZoneAlertAt.set(t.id, Date.now());
  const flavor = flavorFor(t);
  ping({ ...flavor, tag: `${tagPrefix || 'zone'}-${t.id}`, tone: 'alert' });
  if (voice) speakCharacterLine('uncle');
  return true;
}

export function setGpsLive(on, label) {
  const pill = document.querySelector('#gpsLive');
  if (!pill) return;
  if (!on) {
    pill.classList.add('hidden');
    return;
  }
  pill.classList.remove('hidden');
  pill.innerHTML = `<i></i><b>GPS LIVE</b> · watching ${label || 'your vicinity'} for chaos`;
}

export function alertIfEnteredZone(coords, { force = false } = {}) {
  rememberPosition(coords);
  const near = nearestTerritory(coords);
  const closeEnough = Boolean(near && (near.inRadius || near.km <= CITY_VOICE_KM));
  if (!closeEnough) {
    lastTerritoryId = null;
    setGpsLive(true, 'open ground');
    return near;
  }
  const t = near.territory;
  setGpsLive(true, t.name);
  const changed = t.id !== lastTerritoryId;
  const previous = lastTerritoryId;
  lastTerritoryId = t.id;

  if (force) {
    briefTerritory(t, { tagPrefix: 'here', force: true });
    return near;
  }
  if (!changed) return near;
  if (!previous) {
    briefTerritory(t, { tagPrefix: 'lock' });
    return near;
  }
  briefTerritory(t, { tagPrefix: 'enter' });
  return near;
}

export function alertIfScouting(territoryOrId) {
  const t = typeof territoryOrId === 'string' ? territoryById(territoryOrId) : territoryOrId;
  if (!t) return;
  if (t.id === lastTerritoryId) return;
  const score = vibeScore(t);
  const spicy = (t.stats.baddie || 0) >= 55 || (t.stats.chaos || 0) >= 55 || (t.stats.makeout || 0) >= 55 || score >= 50;
  if (!spicy) return;
  briefTerritory(t, { tagPrefix: 'scout', voice: false });
}

export function alertIfNearbySighting({ territoryId, category, intensity = 3, coords, mine = false }) {
  if (mine) return;
  if (!userCoords) return;
  if (intensity < 3) return;
  if (Date.now() - lastGlobalAlertAt < GLOBAL_GAP_MS) return;

  const t = territoryById(territoryId);
  const pin = coords || t?.coords;
  if (!pin) return;
  const km = distanceKm(userCoords, pin);
  if (km > NEARBY_KM && t?.id !== lastTerritoryId) return;

  const key = `${territoryId}:${category}`;
  if (tooSoon(lastSpotAlertAt, key, PER_SPOT_GAP_MS)) return;
  lastGlobalAlertAt = Date.now();

  const cat = CATEGORIES.find((c) => c.id === category || c.label === category);
  const label = cat?.label || category || 'Sighting';
  const emoji = cat?.emoji || '🚨';
  const metres = Math.max(40, Math.round(km * 1000));
  const where = t ? t.name : 'your vicinity';
  const spicy = /baddie|makeout|chapri|chaos/i.test(String(category) + (cat?.stat || ''));
  ping({
    icon: emoji,
    title: spicy ? `${label.toUpperCase()} JUST SPIKED NEAR YOU` : `${label.toUpperCase()} NEAR YOU`,
    body: `${metres}m away in ${where}. Count ticked up. You did not hear this from us.`,
    tag: `near-${key}`,
    tone: 'alert',
  });
}
