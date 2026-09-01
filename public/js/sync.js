import { applyRemoteEvent, applyRemoteWorld, state, territoryById } from './state.js';
import { CATEGORIES } from './data.js';
import { eventFingerprint, sanitizeSighting } from './world.js';

const pushed = new Set();

function localReportEvents(remoteIds, remoteTerritoryIds) {
  const posted = new Set(state.agent.postedIds || []);
  return state.sightings
    .filter((s) => s?.id && (s.mine || posted.has(s.id)) && !remoteIds.has(s.id))
    .map((s) => {
      const t = territoryById(s.territoryId);
      const cat = CATEGORIES.find((c) => c.id === s.categoryId);
      return {
        type: 'report',
        sighting: sanitizeSighting(s),
        newTerritory: t && !remoteTerritoryIds.has(t.id) ? { ...t, stats: { ...t.stats }, coords: [...t.coords] } : null,
        stat: cat?.stat,
        statDelta: 0,
      };
    });
}

export async function hydrateSharedWorld() {
  const res = await fetch('/api/world', { cache: 'no-store' });
  if (!res.ok) throw new Error('world unavailable');
  const remote = await res.json();
  const remoteIds = new Set((remote.sightings || []).map((s) => s.id));
  const remoteTerritoryIds = new Set((remote.territories || []).map((t) => t.id));
  applyRemoteWorld(remote);
  const replay = localReportEvents(remoteIds, remoteTerritoryIds);
  for (const event of replay) {
    await pushSharedEvent(event);
  }
}

export async function pushSharedEvent(event) {
  if (!event) return;
  const fp = eventFingerprint(event);
  if (fp) pushed.add(fp);
  try {
    const res = await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok && fp) pushed.delete(fp);
  } catch {
    if (fp) pushed.delete(fp);
  }
}

export function listenSharedEvents(handlers = {}) {
  let last = '';
  let stopped = false;
  let source = null;

  const tick = async () => {
    if (stopped) return;
    try {
      const res = await fetch('/api/world', { cache: 'no-store' });
      if (!res.ok) return;
      const world = await res.json();
      const stamp = `${(world.sightings || []).length}:${world.sightings?.[0]?.id || ''}:${world.liveFight?.id || ''}:${(world.battles || [])[0]?.id || ''}`;
      if (stamp === last) return;
      last = stamp;
      const seen = new Set((state.sightings || []).map((s) => s.id));
      if (world.liveFight) handlers.onFight?.(world.liveFight);
      applyRemoteWorld(world);
      const incoming = (world.sightings || []).find((s) => s?.id && !seen.has(s.id) && !s.mine);
      if (incoming) handlers.onWorldEvent?.({ type: 'report', sighting: incoming });
    } catch {
      /* keep last good map */
    }
  };

  tick();
  const iv = setInterval(tick, 4000);

  if (typeof EventSource !== 'undefined') {
    source = new EventSource('/api/live');
    source.onmessage = (msg) => {
      let event;
      try {
        event = JSON.parse(msg.data);
      } catch {
        return;
      }
      const fp = eventFingerprint(event);
      if (fp && pushed.has(fp)) return;
      if (event.type === 'fight') {
        handlers.onFight?.(event.fight);
        return;
      }
      const changed = applyRemoteEvent(event);
      if (changed) handlers.onWorldEvent?.(event);
    };
    source.onerror = () => {
      source.close();
      source = null;
    };
  }

  return () => {
    stopped = true;
    clearInterval(iv);
    source?.close();
  };
}
