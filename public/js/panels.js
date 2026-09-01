// Everything that is not the map itself: the live sidebar feed, a slim
// area face card, and the posts modal.
import { CATEGORIES, CHARACTERS, MATCHMAKER_PROFILES, ROASTS } from './data.js';
import { playSound } from './combat.js';
import { activeLayers, activeSightings, bandFor, characterFor, elsewhereSightings, hasVoted, homeCoords, homeLabel, hottestElsewhere, levelFor, localSightings, recordRouletteSpin, sightingStatCounts, sightingsFor, state, territoryById, vibeScore } from './state.js';
import { $, celebrate, el, timeAgo, toast } from './ui.js';

const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

let hooks = {};
export function setupPanels(callbacks) {
  hooks = callbacks;
}

/* ---------- sidebar ---------- */

function feedCard(s) {
  const t = territoryById(s.territoryId);
  const cat = catOf(s.categoryId);
  return `<article class="feed-item ${s.nsfw ? 'nsfw-item' : ''}" data-focus="${s.territoryId}">
              ${s.scan?.image ? `<img src="${s.scan.image}" alt="Pixelated field evidence" />` : `<span class="feed-emoji">${cat.emoji}</span>`}
              <span class="feed-dot ${s.nsfw ? 'nsfw-dot' : ''}"></span>
              <div>
                <b>${cat.emoji} ${cat.label.toUpperCase()} ${s.nsfw ? '<em class="nsfw-tag">18+</em>' : ''}</b>
                <p>${t ? t.name : 'Unknown sector'} · “${s.note}”</p>
                <small>${timeAgo(s.at)}${s.up ? ` · 👍 ${s.up}` : ''}</small>
              </div>
            </article>`;
}

export function renderSidebar() {
  const agent = state.agent;
  const lvl = levelFor(agent.xp);
  const allSightings = activeSightings();
  const home = homeCoords();
  const cityName = homeLabel();
  const local = home ? localSightings() : [];
  const remote = home ? elsewhereSightings() : [];

  $('#agentCard').innerHTML = `
    <span>YOU: <b>${lvl.name}</b></span>
    <span>${agent.xp} XP</span>
    <span>${agent.reports} POSTS</span>
    ${state.ui.nsfw ? '<span class="nsfw-pill">🔞 AFTER DARK</span>' : ''}
    ${agent.combo > 1 ? `<span class="combo">🔥 x${agent.combo}</span>` : ''}`;
  $('#liveCount').textContent = `${state.territories.length} AREAS · ${allSightings.length} POSTS LIVE`;
  const dockCount = $('#feedDockCount');
  if (dockCount) dockCount.textContent = String(local.length || remote.length || allSightings.length);
  const feedTitle = document.querySelector('#liveSidebar .sidebar-title');
  if (feedTitle) feedTitle.innerHTML = cityName ? `<i></i> LIVE · ${cityName.toUpperCase()}` : `<i></i> LIVE FEED`;
  const sectionTitle = document.querySelector('#liveSidebar .section-title');
  if (sectionTitle) sectionTitle.innerHTML = `IN YOUR AREA <span>●</span>`;

  let html;
  if (!home) {
    html = state.ui.gpsDenied
      ? `<p class="empty">Location is off, so we refused to dump you in a random metro.<br /><br />Search your city up top, or tap <b>MY LOCATION</b> and allow GPS.</p>`
      : `<p class="empty">Locking onto your city… Allow location so we land on YOUR streets, not a random metro.</p>`;
  } else if (local.length) {
    html = local.slice(0, 10).map(feedCard).join('');
  } else {
    const peek = hottestElsewhere();
    const place = peek?.label || 'a louder city';
    html = `<div class="boring-banner">
        <b>BORING CITY. VERY LESS CHAPPRIS.</b>
        <p>The ring lights filed for unemployment. Showing you latest intel from ${place} — a place that actually clocked in.</p>
      </div>`;
    if (remote.length) {
      html += remote.slice(0, 10).map(feedCard).join('');
    } else if (peek) {
      html += `<article class="elsewhere-card" data-elsewhere="${peek.territory.id}">
           <button type="button" class="elsewhere-go">SHOW ME ${peek.label.toUpperCase()} →</button>
         </article>`;
    } else {
      html += `<p class="empty">Even the other cities are behaving. Hit <b>+ REPORT SIGHTING</b> and ruin the peace.</p>`;
    }
  }
  $('#feed').innerHTML = html;

  $('#feed').onclick = (e) => {
    const peek = e.target.closest('[data-elsewhere]');
    if (peek) {
      hooks.onPeekElsewhere?.(peek.dataset.elsewhere);
      return;
    }
    const item = e.target.closest('[data-focus]');
    if (item) hooks.onFocusTerritory?.(item.dataset.focus);
  };
}

/* ---------- Live ranked stat board ---------- */

function rankedLayerStats(t) {
  const counts = sightingStatCounts(t.id);
  return activeLayers()
    .map((l) => ({
      ...l,
      reports: counts[l.key] || 0,
      value: t.stats[l.key] || 0,
    }))
    .sort((a, b) => b.reports - a.reports || b.value - a.value);
}

/* ---------- territory dossier (map sheet) ---------- */

/* ---------- territory dossier (map sheet) ---------- */

export function renderDossier(id) {
  const t = territoryById(id);
  const box = $('#dossier');
  if (!t) return box.classList.add('hidden');
  const score = vibeScore(t);
  const band = bandFor(score);
  const char = CHARACTERS[characterFor(t)] || CHARACTERS.chapri;
  const recent = sightingsFor(t.id);
  const lead = rankedLayerStats(t)[0];
  const nsfw = Boolean(state.ui.nsfw);

  box.classList.remove('hidden');
  box.innerHTML = `
    <button class="dossier-x" aria-label="Close">×</button>

    <div class="dossier-head">
      <div class="dossier-avatar-wrap">
        <img src="${char.file}" alt="${char.name}" />
        <span class="avatar-shout-pill">${char.name}</span>
      </div>
      <div>
        <div class="eyebrow">${t.zone}</div>
        <h3>${t.name.toUpperCase()}</h3>
        <div class="dossier-score" style="color:${band.color}">
          <span class="score-number">${score}</span><small>/100</small>
        </div>
        <div class="band-chip" style="border-color:${band.color};color:${band.color}">${band.icon} ${band.label}</div>
      </div>
    </div>

    <p class="dossier-note">“${band.note}”</p>
    <p class="dossier-lead">${lead?.reports ? `${lead.emoji} Mostly ${lead.label.toLowerCase()} · ${recent.length} post${recent.length === 1 ? '' : 's'}` : `${recent.length} post${recent.length === 1 ? '' : 's'} on record`}</p>

    <div class="dossier-recent">
      ${
        recent.length
          ? recent
              .slice(0, 4)
              .map(
                (s) => `<article class="area-post ${s.nsfw ? 'nsfw-post' : ''}" data-sighting="${s.id}">
            <span>${catOf(s.categoryId).emoji}</span>
            <div>
              <b>${catOf(s.categoryId).label}${s.nsfw ? ' <em class="nsfw-tag">18+</em>' : ''}</b>
              <p>“${s.note}”</p>
              <small>${timeAgo(s.at)}${s.up ? ` · 👍 ${s.up}` : ''}</small>
            </div>
          </article>`,
              )
              .join('')
          : '<p class="empty-posts">Quiet so far. Be the first to log it.</p>'
      }
      ${recent.length > 2 ? `<button class="view-all-btn" data-act="view-all">VIEW ALL ${recent.length} POSTS →</button>` : ''}
    </div>

    <div class="dossier-actions">
      <button class="submit" data-act="report"><span class="report-full">+ REPORT HERE</span><span class="report-short">+ REPORT</span></button>
      <button class="ghost-wide fight-button" data-act="battle">${nsfw ? '💋 START A SITUATIONSHIP' : '<span class="fight-full">🥊 CHALLENGE A NEIGHBOUR</span><span class="fight-short">🥊 FIGHT</span>'}</button>
    </div>`;

  box.querySelector('.dossier-x').onclick = () => hooks.onCloseDossier?.();
  box.querySelector('[data-act="report"]').onclick = () => hooks.onReportHere?.(t.id);
  box.querySelector('[data-act="battle"]').onclick = () => hooks.onBattleFrom?.(t.id);
  const viewAllBtn = box.querySelector('[data-act="view-all"]');
  if (viewAllBtn) viewAllBtn.onclick = () => openAreaPostsModal(t.id);
}

export function hideDossier() {
  $('#dossier').classList.add('hidden');
}

/* ---------- Localized Roast Generator ---------- */
export function roastSector(territoryId) {
  const t = territoryById(territoryId);
  if (!t) return;
  const isNsfw = Boolean(state.ui.nsfw);
  const roastObj = ROASTS[t.id];
  const roastText = isNsfw
    ? roastObj?.nsfw || `${t.name} After Dark: Suspicious parked cars, maximum unbuttoning, and people pretending they don’t see each other.`
    : roastObj?.sfw || `${t.name}: 100% confidence, 0% parking, and at least 3 people filming a dance reel right now.`;

  playSound(isNsfw ? 'sultry_whisper' : 'aunty_alarm');
  toast({
    icon: '🔥',
    title: `SURVEILLANCE ROAST: ${t.name.toUpperCase()}`,
    body: roastText,
    tone: 'info',
    ms: 7500,
  });
}

/* ---------- Gen-Z Makeout Roulette Modal ---------- */
export function openMatchmaker(territoryId) {
  const t = territoryById(territoryId) || state.territories[0];
  const dialog = $('#matchmakerDialog');
  if (!dialog) return;

  const profiles = [...MATCHMAKER_PROFILES].sort(() => Math.random() - 0.5);
  const picked = profiles[0];

  $('#matchmakerBody').innerHTML = `
    <div class="eyebrow">🎰 CASUAL MAKEOUT ROULETTE · ${t.name.toUpperCase()}</div>
    <h2>Finding a Match in ${t.name}...</h2>
    <div class="roulette-slot-machine">
      <div class="slot-display" id="slotDisplay">
        <img class="slot-avatar" src="${picked.avatar}" alt="" />
        <div class="slot-details">
          <b>${picked.name}, ${picked.age}</b>
          <span class="slot-tag">${picked.tag}</span>
          <p class="slot-vibe">“${picked.vibe}”</p>
          <div class="slot-redflags">Red Flags: ${'🚩'.repeat(picked.redFlags)}</div>
        </div>
      </div>
    </div>

    <div class="roulette-actions">
      <button class="submit" id="spinAgainBtn">🎲 SPIN AGAIN IN ${t.name.toUpperCase()}</button>
      <button class="ghost-wide" id="sendDmBtn">🫦 SEND TOXIC 2AM DM →</button>
    </div>
  `;

  playSound('roulette_spin');
  setTimeout(() => playSound('jackpot'), 350);

  const unlocked = recordRouletteSpin();
  if (unlocked?.length) celebrate(null, unlocked);

  $('#spinAgainBtn').onclick = () => {
    playSound('roulette_spin');
    openMatchmaker(territoryId);
  };

  $('#sendDmBtn').onclick = () => {
    playSound('kiss_smooch');
    toast({ icon: '🫦', title: 'TOXIC DM TRANSMITTED', body: `“Hey ${picked.name}, are you still in ${t.name}? Asking for a friend 😏”`, tone: 'good', ms: 5000 });
    dialog.close();
  };

  if (!dialog.open) {
    dialog.showModal();
  }
}

/* ---------- Area Posts Modal (Unified Sighting Cluster Viewer) ---------- */
export function openAreaPostsModal(territoryId, filteredSightings) {
  const t = territoryById(territoryId);
  const posts = filteredSightings || sightingsFor(territoryId);
  const dialog = $('#areaPostsDialog');
  if (!dialog) return;

  const areaName = t ? t.name.toUpperCase() : 'INCIDENT CLUSTER';

  $('#areaPostsBody').innerHTML = `
    <div class="eyebrow">📍 FIELD INTELLIGENCE DOSSIER · ${t?.zone || 'FIELD'}</div>
    <h2>${areaName} SIGHTINGS (${posts.length})</h2>
    <p class="muted">All verified incidents and field observations logged in this specific area.</p>

    <div class="area-modal-posts">
      ${
        posts.length
          ? posts
              .map((s) => {
                const cat = catOf(s.categoryId);
                return `
              <div class="spot-post-card ${s.nsfw ? 'nsfw-card' : ''}" data-sighting-id="${s.id}">
                <div class="spot-card-top">
                  <span class="spot-emoji">${cat.emoji}</span>
                  <div class="spot-meta">
                    <b>${cat.label.toUpperCase()} ${s.nsfw ? '<span class="nsfw-badge">🔞 18+</span>' : ''}</b>
                    <small>Intensity: ${'💀'.repeat(s.intensity || 1)} (${s.intensity}/5) · ${timeAgo(s.at)}</small>
                  </div>
                </div>

                <p class="spot-note">“${s.note}”</p>

                ${s.scan?.image ? `<div class="spot-evidence"><img src="${s.scan.image}" alt="Evidence" /><small>🧠 AI VERDICT: ${s.scan.verdict}</small></div>` : ''}

                <div class="spot-card-bottom">
                  <div class="vote-actions">
                    <button class="vote-btn up-btn" data-vote="up" data-id="${s.id}" ${hasVoted(s.id) ? 'disabled' : ''}>
                      👍 CONFIRM <b>${s.up}</b>
                    </button>
                    <button class="vote-btn down-btn" data-vote="down" data-id="${s.id}" ${hasVoted(s.id) ? 'disabled' : ''}>
                      👎 DOUBT <b>${s.down}</b>
                    </button>
                  </div>
                  ${hasVoted(s.id) ? `<span class="voted-tag">✓ You voted</span>` : ''}
                </div>
              </div>
            `;
              })
              .join('')
          : '<p class="empty">No reports recorded at this spot yet. Be the first to log a sighting!</p>'
      }
    </div>

    <div class="area-modal-actions">
      ${t ? `<button class="submit" id="areaModalReportBtn">+ REPORT INCIDENT IN ${t.name.toUpperCase()}</button>` : ''}
    </div>
  `;

  $('#areaPostsBody')
    .querySelectorAll('[data-vote]')
    .forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const dir = btn.dataset.vote;
        hooks.onVote?.(id, dir);
        setTimeout(() => openAreaPostsModal(territoryId), 150);
      };
    });

  $('#areaModalReportBtn')?.addEventListener('click', () => {
    dialog.close();
    if (t) hooks.onReportHere?.(t.id);
  });

  dialog.showModal();
}

/* ---------- sighting popup ---------- */

export function sightingCard(sighting) {
  const cat = catOf(sighting.categoryId);
  const t = territoryById(sighting.territoryId);
  const node = el(`<div class="sighting-card ${sighting.nsfw ? 'nsfw-card' : ''}">
      <div class="eyebrow">🚨 SIGHTING #${String(sighting.id).slice(-5)} ${sighting.nsfw ? '· 🔞 18+' : ''}</div>
      <b>${cat.emoji} ${cat.label.toUpperCase()}</b>
      <p class="where">${t ? t.name : 'Unknown sector'} · intensity ${sighting.intensity}/5</p>
      <p class="quote">“${sighting.note}”</p>
      ${sighting.scan?.image ? `<img class="post-image" src="${sighting.scan.image}" alt="Pixelated field evidence" />` : ''}
      ${sighting.scan ? `<p class="scanned">🧠 CHAPPRIVISION: ${sighting.scan.verdict}</p>` : ''}
      <small>${timeAgo(sighting.at)}${sighting.mine ? ' · logged by you' : ''}</small>
      <div class="vote-buttons">
        <button data-dir="up" ${hasVoted(sighting.id) ? 'disabled' : ''}>👍 CONFIRM <b>${sighting.up}</b></button>
        <button data-dir="down" ${hasVoted(sighting.id) ? 'disabled' : ''}>👎 DOUBT <b>${sighting.down}</b></button>
      </div>
      ${hasVoted(sighting.id) ? '<p class="voted">Your review is on record.</p>' : ''}
      <button class="view-spot-all-btn" data-territory="${sighting.territoryId}">📍 VIEW ALL POSTS IN THIS SPOT →</button>
    </div>`);

  node.querySelectorAll('[data-dir]').forEach((b) => (b.onclick = () => hooks.onVote?.(sighting.id, b.dataset.dir)));
  node.querySelector('.view-spot-all-btn')?.addEventListener('click', () => openAreaPostsModal(sighting.territoryId));
  return node;
}

/* ---------- map legend ---------- */

export function renderLegend() {
  const layer = activeLayers().find((l) => l.key === state.ui.layer) || activeLayers()[0];
  const leader = territoryById(state.ui.layerLeader);
  const leadCount = leader ? sightingStatCounts(leader.id)[layer.key] || 0 : 0;
  $('#mapLegend').innerHTML = `
    <b>${layer.emoji} ${layer.unit.toUpperCase()}</b>
    ${leader ? `<span class="legend-leader">👑 ${leader.name.toUpperCase()} · ${leadCount || leader.stats[layer.key] || 0}</span>` : ''}
    ${state.ui.nsfw ? '<span class="legend-nsfw">🔞 AFTER DARK</span>' : ''}
    <span><i style="background:#ff4d40"></i>HOT</span>
    <span><i style="background:#ffbf3f"></i>MID</span>
    <span><i style="background:#7ef29d"></i>CALM</span>`;
}
