// Pick a neighbouring or rival sector, then settle it on the animated combat arena.
import { CHARACTERS, LAYERS } from './data.js';
import { characterFor, distanceKm, neighbourIds, state, territoryById, vibeScore } from './state.js';
import { $ } from './ui.js';

const dialog = () => $('#battleDialog');
const LABELS = Object.fromEntries(LAYERS.map((l) => [l.key, `${l.emoji} ${l.label}`]));
let hooks = {};

export function setupBattles(callbacks) {
  hooks = callbacks;
}

const charImg = (t) => (CHARACTERS[characterFor(t)] || CHARACTERS.chapri).file;

function contested(a, b) {
  return LAYERS.filter((l) => l.key !== 'npc')
    .map((l) => ({ ...l, heat: (a.stats[l.key] || 0) + (b.stats[l.key] || 0) }))
    .sort((x, y) => y.heat - x.heat)
    .slice(0, 5);
}

export function openBattlePicker(fromId) {
  const home = territoryById(fromId) || state.territories[0];
  if (!home) return;
  dialog().showModal();
  renderChallengers(home);
}

function renderChallengers(home) {
  const ids = neighbourIds(home.id);
  const neighbours = ids.map(territoryById).filter(Boolean).sort((a, b) => vibeScore(b) - vibeScore(a));
  const otherSectors = state.territories.filter((t) => t.id !== home.id && !ids.includes(t.id));
  const isBaddie = characterFor(home) === 'baddie';

  $('#battleBody').innerHTML = `
    <div class="eyebrow">CHOOSE CHALLENGER · LIVE COMBAT ARENA</div>
    <h2>${home.name.toUpperCase()} wants smoke 🥊</h2>
    <p class="muted">${state.ui.nsfw ? 'Pick a neighbour. They will lean in. No punches. Chemistry only.' : 'Pick a rival sector. Animated punch combos land on the live map — only you see the big arena.'}</p>

    <div class="battle-tabs">
      <button class="battle-tab on" id="tabNeighbours">NEARBY NEIGHBOURS (${neighbours.length})</button>
      <button class="battle-tab" id="tabAll">ALL NCR SECTORS (${otherSectors.length})</button>
    </div>

    <div class="pick-grid" id="battleGrid">
      ${renderCards(home, neighbours)}
    </div>`;

  const grid = $('#battleGrid');
  const tabNeighbours = $('#tabNeighbours');
  const tabAll = $('#tabAll');

  tabNeighbours.onclick = () => {
    tabNeighbours.classList.add('on');
    tabAll.classList.remove('on');
    grid.innerHTML = renderCards(home, neighbours);
  };

  tabAll.onclick = () => {
    tabAll.classList.add('on');
    tabNeighbours.classList.remove('on');
    grid.innerHTML = renderCards(home, otherSectors);
  };

  $('#battleBody').onclick = (e) => {
    const card = e.target.closest('.pick-card');
    if (card) runBattle(home, territoryById(card.dataset.id));
  };
}

function renderCards(home, list) {
  return list
    .map(
      (t) => `
      <button class="pick-card live" data-id="${t.id}">
        <img src="${charImg(t)}" alt="" loading="lazy" />
        <b>${t.name.toUpperCase()}</b>
        <span>${Math.round(distanceKm(home.coords, t.coords) * 10) / 10} km · VIBE ${vibeScore(t)}</span>
        <em>${characterFor(t) === 'baddie' ? '💅 CATFIGHT →' : '🥊 BRAWL →'}</em>
      </button>
    `,
    )
    .join('');
}

function runBattle(a, b) {
  const rounds = contested(a, b).map((l) => {
    const av = a.stats[l.key] || 0;
    const bv = b.stats[l.key] || 0;
    const winner = av === bv ? (vibeScore(a) >= vibeScore(b) ? a.id : b.id) : av > bv ? a.id : b.id;
    return { stat: l.key, label: LABELS[l.key], av, bv, winner };
  });
  const aWins = rounds.filter((r) => r.winner === a.id).length;
  const winner = aWins > rounds.length / 2 ? a : b;
  dialog().close();
  hooks.onStartFight?.({ id: `f${Date.now()}`, a: a.id, b: b.id, rounds, winner: winner.id, at: Date.now() });
}
