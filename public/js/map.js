// Leaflet surface: blurred heat blobs, animated characters, incident sticker clusters,
// GPS radar tracker, search navigation, and dynamic multi-round combat engine.
import { CATEGORIES, CHARACTERS, LANDMARKS } from './data.js';
import { buildFightHtml, runCombatSequence } from './combat.js';
import { activeLayers, activeSightings, bandFor, characterFor, characterForLayer, distanceKm, heatRadiusMeters, nearestTerritory, qualifiesForLayer, sightingStatCounts, state, territoryById, vibeScore } from './state.js';

let map;
let handlers = {};
let charLayer;
let heatLayer;
let pinLayer;
let fightLayer;
let pickMarker = null;
let userMarker = null;
let picking = false;
const charMarkers = new Map();
const fightingIds = new Set();

const MOODS = [
  [96, 'boss'],
  [81, 'rage'],
  [61, 'hype'],
  [41, 'idle'],
  [0, 'chill'],
];

const mood = (score) => MOODS.find(([min]) => score >= min)[1];

function zoomScale({ selected = false } = {}) {
  const z = map.getZoom();
  const phone = window.innerWidth < 860;
  let s = 1.4;
  if (z <= 5) s = 0.22;
  else if (z <= 7) s = 0.32;
  else if (z <= 9) s = 0.5;
  else if (z === 10) s = 0.62;
  else if (z === 11) s = 0.8;
  else if (z === 12) s = 1;
  else if (z === 13) s = 1.18;
  return phone && !selected ? s * 0.62 : s;
}

export function initMap(callbacks) {
  handlers = callbacks;
  const phone = window.innerWidth < 860;
  map = L.map('map', { zoomControl: false, minZoom: 4, maxZoom: 18, zoomSnap: 1 }).setView([28.56, 77.19], phone ? 10 : 11);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '' }).addTo(map);

  map.createPane('heat').style.zIndex = 350;
  map.createPane('gps').style.zIndex = 400;
  map.createPane('chars').style.zIndex = 600;
  map.createPane('sightings').style.zIndex = 650;
  map.createPane('fights').style.zIndex = 750;

  heatLayer = L.layerGroup().addTo(map);
  pinLayer = L.layerGroup().addTo(map);
  charLayer = L.layerGroup().addTo(map);
  fightLayer = L.layerGroup().addTo(map);

  map.on('click', (e) => {
    if (picking) return placePin([+e.latlng.lat.toFixed(5), +e.latlng.lng.toFixed(5)]);
    handlers.onBlankClick?.();
  });
  map.on('zoomend', () => {
    resizeCharacters();
    drawSightings();
  });
  return map;
}

/* ---------- pin mode ---------- */

export function armPin() {
  picking = true;
  map.getContainer().classList.add('picking');
}

export function disarmPin() {
  picking = false;
  map.getContainer().classList.remove('picking');
}

export function clearPin() {
  if (pickMarker) map.removeLayer(pickMarker);
  pickMarker = null;
  disarmPin();
}

function placePin(coords) {
  if (pickMarker) map.removeLayer(pickMarker);
  pickMarker = L.marker(coords, {
    draggable: true,
    icon: L.divIcon({ className: 'drop-pin', html: '<b>📍</b>', iconSize: [34, 44], iconAnchor: [17, 44] }),
  }).addTo(map);
  pickMarker.on('dragend', () => {
    const { lat, lng } = pickMarker.getLatLng();
    handlers.onPinMoved?.([+lat.toFixed(5), +lng.toFixed(5)]);
  });
  disarmPin();
  handlers.onPinPlaced?.(coords);
}

export const hasPin = () => Boolean(pickMarker);

/* ---------- rendering ---------- */

export function renderMap() {
  drawHeat();
  drawCharacters();
  drawSightings();
}

/* Heat is drawn on the incidents themselves, not a giant halo around the area centre.
   Two posts 800m apart stay two blobs. More posts in the same pocket grow that blob. */
function drawHeat() {
  heatLayer.clearLayers();
  const key = state.ui.layer;
  const sightings = activeSightings().filter((s) => {
    if (key === 'chaos') return true;
    const cat = CATEGORIES.find((c) => c.id === s.categoryId);
    return cat?.stat === key;
  });

  const clusters = [];
  sightings.forEach((s) => {
    const cluster = clusters.find((c) => distanceKm(c.coords, s.coords) < 0.22);
    if (cluster) {
      cluster.items.push(s);
      const n = cluster.items.length;
      cluster.coords = [
        cluster.items.reduce((sum, x) => sum + x.coords[0], 0) / n,
        cluster.items.reduce((sum, x) => sum + x.coords[1], 0) / n,
      ];
    } else {
      clusters.push({ coords: [...s.coords], items: [s] });
    }
  });

  clusters.forEach((cluster) => {
    const n = cluster.items.length;
    const maxIntensity = Math.max(...cluster.items.map((x) => x.intensity || 1));
    const vibe = Math.min(100, 40 + n * 12 + maxIntensity * 6);
    const band = bandFor(vibe);
    L.circle(cluster.coords, {
      pane: 'heat',
      radius: heatRadiusMeters(n),
      color: band.color,
      fillColor: band.color,
      fillOpacity: 0.22 + Math.min(0.45, n * 0.07),
      weight: 0,
      interactive: false,
    }).addTo(heatLayer);
  });
}

function resolveCharacterKey(t) {
  return characterForLayer(t, state.ui.layer);
}

function characterIcon(t) {
  const score = vibeScore(t);
  const key = resolveCharacterKey(t);
  const char = CHARACTERS[key] || CHARACTERS.chapri;
  const phone = window.innerWidth < 860;
  const selected = state.ui.selected === t.id;
  const scale = zoomScale({ selected });
  let size = Math.round((46 + score * 0.42) * scale);
  if (selected) size = Math.round(Math.max(size * (phone ? 1.55 : 1.45), phone ? 92 : 68));
  const layerLeader = state.ui.layerLeader === t.id;
  const mini = map.getZoom() < 12 && !selected;
  return L.divIcon({
    pane: 'chars',
    className: `char-icon ${mood(score)} ${selected ? 'selected' : ''} ${fightingIds.has(t.id) ? 'fighting' : ''}`,
    html: `<div class="char-body" style="--size:${size}px">
        ${layerLeader ? '<i class="crown">👑</i>' : ''}
        <img src="${char.file}" alt="${char.name}" loading="lazy" draggable="false" />
        <span class="char-tag ${mini ? 'mini' : ''}"><b>${t.name.toUpperCase()}</b><em style="color:${bandFor(score).color}">${score}</em></span>
        <span class="char-shout">${char.shout}</span>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function drawCharacters() {
  charLayer.clearLayers();
  charMarkers.clear();
  map.getContainer().classList.toggle('small-zoom', map.getZoom() <= 10);
  const key = state.ui.layer;
  const leader = [...state.territories]
    .filter((t) => qualifiesForLayer(t, key))
    .sort((a, b) => {
      if (key === 'chaos') return vibeScore(b) - vibeScore(a);
      return (sightingStatCounts(b.id)[key] || 0) - (sightingStatCounts(a.id)[key] || 0);
    })[0];
  state.ui.layerLeader = leader?.id;

  // Chaos: every area. A named filter: only areas with actual matching posts.
  state.territories
    .filter((t) => qualifiesForLayer(t, key))
    .forEach((t) => {
      const marker = L.marker(t.coords, { icon: characterIcon(t), pane: 'chars', riseOnHover: true, keyboard: false });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (picking) return placePin([...t.coords]);
        handlers.onTerritoryClick?.(t.id);
      });
      marker.addTo(charLayer);
      charMarkers.set(t.id, marker);
    });
}

function resizeCharacters() {
  map.getContainer().classList.toggle('small-zoom', map.getZoom() <= 10);
  charMarkers.forEach((marker, id) => {
    const t = state.territories.find((x) => x.id === id);
    if (t) marker.setIcon(characterIcon(t));
  });
}

const PIN_ZOOM = 11;

/* ---------- Sighting Clustering & Stickers ---------- */
function drawSightings() {
  pinLayer.clearLayers();
  if (map.getZoom() < PIN_ZOOM && state.ui.layer === 'chaos') return;

  const sightings = activeSightings().filter((s) => {
    if (state.ui.layer === 'chaos') return true;
    const cat = CATEGORIES.find((c) => c.id === s.categoryId);
    return cat?.stat === state.ui.layer;
  });

  // Geographical proximity clustering (~500m / 0.005 deg)
  const clusters = [];

  sightings.forEach((s) => {
    let cluster = clusters.find((c) => {
      const dLat = Math.abs(c.coords[0] - s.coords[0]);
      const dLng = Math.abs(c.coords[1] - s.coords[1]);
      return dLat < 0.006 && dLng < 0.006;
    });

    if (!cluster) {
      cluster = {
        territoryId: s.territoryId,
        coords: [...s.coords],
        items: [],
      };
      clusters.push(cluster);
    }
    cluster.items.push(s);
  });

  clusters.forEach((cluster) => {
    const topSighting = cluster.items[0];
    const cat = CATEGORIES.find((c) => c.id === topSighting.categoryId) || CATEGORIES[0];
    const count = cluster.items.length;
    const hasNsfw = cluster.items.some((x) => x.nsfw);
    const maxIntensity = Math.max(...cluster.items.map((x) => x.intensity || 1));

    const iconHtml = `
      <div class="sticker-cluster-pin i${maxIntensity} ${hasNsfw ? 'nsfw-cluster' : ''}">
        <div class="sticker-badge">
          <span class="sticker-emoji">${cat.emoji}</span>
          ${count > 1 ? `<span class="cluster-count">${count}</span>` : ''}
          ${hasNsfw ? '<span class="cluster-nsfw-dot">🔞</span>' : ''}
        </div>
      </div>
    `;

    const marker = L.marker(cluster.coords, {
      pane: 'sightings',
      icon: L.divIcon({
        className: 'sighting-cluster-icon',
        html: iconHtml,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
      }),
    });

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (picking) return placePin([...cluster.coords]);
      if (handlers.onClusterClick) {
        handlers.onClusterClick(cluster.territoryId, cluster.items, marker);
      } else if (handlers.onSightingClick) {
        handlers.onSightingClick(topSighting.id, marker);
      }
    });

    marker.addTo(pinLayer);
  });
}

/* ---------- Camera + Effects ---------- */

export function focusTerritory(id, zoom = 13) {
  const t = state.territories.find((x) => x.id === id);
  if (!t || !map) return;
  map.stop();
  map.flyTo(t.coords, zoom, { duration: 0.7 });
}

export function focusCoords(coords, zoom = 14) {
  if (!map || !coords) return;
  map.stop();
  map.flyTo(coords, zoom, { duration: 0.7 });
}

export function snapToUser(coords, { instant = false } = {}) {
  if (!map || !coords) return;
  placeUserMarker(coords);
  map.stop();
  if (instant) map.setView(coords, 14, { animate: false });
  else map.flyTo(coords, 14, { duration: 0.85 });
}

export function popCharacter(id, text) {
  const marker = charMarkers.get(id);
  const el = marker?.getElement()?.querySelector('.char-body');
  if (!el) return;
  el.classList.add('pop');
  if (text) {
    const shout = el.querySelector('.char-shout');
    if (shout) {
      shout.textContent = text;
      shout.classList.add('forced');
      setTimeout(() => shout.classList.remove('forced'), 2600);
    }
  }
  setTimeout(() => el.classList.remove('pop'), 700);
}

/* ---------- Upgraded Combat Arena Animation ---------- */
export function animateFight(fight, { focus = false, compact = false, onDone } = {}) {
  const a = territoryById(fight.a);
  const b = territoryById(fight.b);
  if (!a || !b) return;

  const center = [(a.coords[0] + b.coords[0]) / 2, (a.coords[1] + b.coords[1]) / 2];
  const aChar = characterFor(a);
  const bChar = characterFor(b);
  const winner = fight.winner === a.id ? a : b;
  const loser = winner === a ? b : a;
  const nsfw = Boolean(state.ui.nsfw);

  if (focus) map.flyTo(center, 14, { duration: 0.8 });

  const fightHtml = buildFightHtml(fight, a, b, aChar, bChar, winner, loser);
  const html = compact
    ? `<div class="observer-fight-wrap">${fightHtml}<div class="observer-fight-hint">TAP TO ZOOM</div></div>`
    : fightHtml;
  const phone = window.innerWidth < 860;
  const size = compact ? (phone ? [132, 98] : [168, 124]) : phone ? [300, 230] : [420, 310];

  const marker = L.marker(center, {
    pane: 'fights',
    interactive: compact,
    icon: L.divIcon({
      className: `map-fight-icon ${compact ? 'compact' : ''}`,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1] / 2],
      html,
    }),
  }).addTo(fightLayer);

  if (compact) {
    marker.on('click', () => map.flyTo(center, 14, { duration: 0.55 }));
  }

  fightingIds.add(a.id).add(b.id);
  resizeCharacters();

  const note = document.querySelector('#liveFightNote');
  if (note) {
    note.classList.remove('hidden');
    const verb = nsfw ? 'caught in a situationship with' : 'throwing down with';
    note.innerHTML = compact
      ? `<i></i><b>LIVE NEARBY:</b> ${a.name} vs ${b.name} · tap the small arena to zoom`
      : `<i></i><b>${nsfw ? 'LIVE CHEMISTRY' : 'LIVE COMBAT'}:</b> ${a.name} is ${verb} ${b.name}`;
  }

  // Execute multi-stage combat sequence
  setTimeout(() => {
    const container = marker.getElement();
    if (container) {
      runCombatSequence(container, fight, a, b, aChar, bChar, winner, loser, () => {
        fightLayer.removeLayer(marker);
        fightingIds.delete(a.id);
        fightingIds.delete(b.id);
        resizeCharacters();
        note?.classList.add('hidden');
        onDone?.();
      });
    } else {
      setTimeout(() => {
        fightLayer.removeLayer(marker);
        fightingIds.delete(a.id);
        fightingIds.delete(b.id);
        resizeCharacters();
        note?.classList.add('hidden');
        onDone?.();
      }, 7600);
    }
  }, 100);
}

export function openSightingPopup(marker, node) {
  marker.bindPopup(node, { className: 'sighting-popup', minWidth: 260, closeButton: true }).openPopup();
}

export function layerOptionsHtml() {
  const layers = activeLayers();
  return layers.map((l) => `<option value="${l.key}">${l.emoji} ${l.label}</option>`).join('');
}

export function invalidate() {
  setTimeout(() => map.invalidateSize(), 60);
}

/* ---------- Accurate GPS Tracker & Radar Marker ---------- */
function placeUserMarker(coords) {
  if (userMarker) {
    userMarker.setLatLng(coords);
    return;
  }
  userMarker = L.marker(coords, {
    pane: 'gps',
    icon: L.divIcon({
      className: 'gps-marker-icon',
      html: `<div class="user-gps-pulse">
          <div class="gps-radar-ring ring1"></div>
          <div class="gps-radar-ring ring2"></div>
          <div class="gps-dot"></div>
          <span class="gps-label">YOU ARE HERE</span>
        </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    }),
  }).addTo(map);
}

let watchId = null;

export function locateMe(onFound, onFail, cached) {
  if (cached) snapToUser(cached, { instant: true });
  if (!navigator.geolocation) {
    if (cached) return onFound?.(cached, nearestTerritory(cached));
    return onFail?.();
  }

  navigator.geolocation.getCurrentPosition(
    (p) => {
      const coords = [+p.coords.latitude.toFixed(5), +p.coords.longitude.toFixed(5)];
      snapToUser(coords, { instant: Boolean(cached) });
      onFound?.(coords, nearestTerritory(coords));
    },
    () => {
      if (cached) {
        snapToUser(cached, { instant: true });
        onFound?.(cached, nearestTerritory(cached));
        return;
      }
      onFail?.();
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 8000 },
  );
}

export function watchUserPosition(onMove) {
  if (!navigator.geolocation || watchId != null) return;
  watchId = navigator.geolocation.watchPosition(
    (p) => {
      const coords = [+p.coords.latitude.toFixed(5), +p.coords.longitude.toFixed(5)];
      placeUserMarker(coords);
      onMove?.(coords, nearestTerritory(coords));
    },
    () => {},
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 8000 },
  );
}

/* ---------- Location & Landmark Search Engine ---------- */
export function searchLocations(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  const results = [];

  // Match territories
  state.territories.forEach((t) => {
    const matchName = t.name.toLowerCase().includes(q);
    const matchZone = t.zone.toLowerCase().includes(q);
    if (matchName || matchZone) {
      results.push({
        type: 'territory',
        id: t.id,
        name: t.name,
        zone: t.zone,
        coords: t.coords,
        vibe: vibeScore(t),
        band: bandFor(vibeScore(t)),
      });
    }
  });

  // Match landmarks
  LANDMARKS.forEach((lm) => {
    if (lm.name.toLowerCase().includes(q) || lm.query.toLowerCase().includes(q)) {
      const t = territoryById(lm.territoryId);
      results.push({
        type: 'landmark',
        id: lm.territoryId,
        name: lm.name,
        zone: lm.zone,
        coords: t ? t.coords : [28.56, 77.19],
        vibe: t ? vibeScore(t) : 70,
        band: t ? bandFor(vibeScore(t)) : bandFor(70),
      });
    }
  });

  // Deduplicate by name
  const seen = new Set();
  return results.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  }).slice(0, 7);
}

const WORLD_PLACES = [
  { name: 'Bangalore', zone: 'Karnataka, India', coords: [12.9716, 77.5946], aliases: ['bengaluru', 'blr'] },
  { name: 'Koramangala', zone: 'Bangalore', coords: [12.9352, 77.6245], aliases: [] },
  { name: 'Indiranagar', zone: 'Bangalore', coords: [12.9784, 77.6408], aliases: [] },
  { name: 'Whitefield', zone: 'Bangalore', coords: [12.9698, 77.7499], aliases: [] },
  { name: 'Mumbai', zone: 'Maharashtra, India', coords: [19.076, 72.8777], aliases: ['bombay'] },
  { name: 'Bandra', zone: 'Mumbai', coords: [19.0596, 72.8295], aliases: [] },
  { name: 'Pune', zone: 'Maharashtra, India', coords: [18.5204, 73.8567], aliases: [] },
  { name: 'Hyderabad', zone: 'Telangana, India', coords: [17.385, 78.4867], aliases: [] },
  { name: 'Chennai', zone: 'Tamil Nadu, India', coords: [13.0827, 80.2707], aliases: ['madras'] },
  { name: 'Kolkata', zone: 'West Bengal, India', coords: [22.5726, 88.3639], aliases: ['calcutta'] },
  { name: 'Jaipur', zone: 'Rajasthan, India', coords: [26.9124, 75.7873], aliases: [] },
  { name: 'Goa', zone: 'India', coords: [15.4909, 73.8278], aliases: [] },
  { name: 'Chandigarh', zone: 'India', coords: [30.7333, 76.7794], aliases: [] },
  { name: 'Ahmedabad', zone: 'Gujarat, India', coords: [23.0225, 72.5714], aliases: [] },
  { name: 'Lucknow', zone: 'Uttar Pradesh, India', coords: [26.8467, 80.9462], aliases: [] },
];

export function worldPlaceSearch(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return WORLD_PLACES.filter((p) => p.name.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q) || p.aliases.some((a) => a.includes(q) || q.includes(a))).map((p) => ({
    type: 'geo',
    id: '',
    name: p.name,
    zone: p.zone,
    coords: p.coords,
    vibe: null,
    band: null,
  }));
}

export async function geocodeSearch(query, { signal } = {}) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const hits = await res.json();
  if (!Array.isArray(hits)) return [];
  return hits.map((h) => {
    const parts = String(h.display_name || '').split(',').map((p) => p.trim()).filter(Boolean);
    return {
      type: 'geo',
      id: '',
      name: parts.slice(0, 2).join(', ') || query,
      zone: parts.slice(2, 5).join(', ') || 'World',
      coords: [Number(h.lat), Number(h.lon)],
      vibe: null,
      band: null,
    };
  });
}
