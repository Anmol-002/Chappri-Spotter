import { applyRemoteEvent, applyRemoteWorld } from './state.js';
import { eventFingerprint } from './world.js';

const pushed = new Set();

export async function hydrateSharedWorld() {
  const res = await fetch('/api/world', { cache: 'no-store' });
  if (!res.ok) throw new Error('world unavailable');
  applyRemoteWorld(await res.json());
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
  if (typeof EventSource === 'undefined') return () => {};
  const source = new EventSource('/api/live');
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
  return () => source.close();
}
