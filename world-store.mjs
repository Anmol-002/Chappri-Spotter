import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySharedEvent, eventFingerprint, mergeStarterWorld, publicWorld, seedWorld } from './public/js/world.js';

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.CHAPPRI_STORE_PATH || join(root, 'data');
const worldFile = join(dataDir, 'world.json');
const jsonBinId = process.env.JSONBIN_BIN_ID || '';
const jsonBinKey = process.env.JSONBIN_API_KEY || '';

let world = seedWorld();
const clients = new Set();
const recent = new Set();
let persistTimer = 0;
let ready = null;

function cloneWorld(value) {
  return JSON.parse(JSON.stringify(value));
}

function validWorld(value) {
  return Boolean(value?.territories?.length && Array.isArray(value.sightings));
}

async function loadJsonBin() {
  if (!jsonBinId || !jsonBinKey) return null;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinId}/latest`, {
      headers: { 'X-Master-Key': jsonBinKey },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return validWorld(json.record) ? json.record : null;
  } catch {
    return null;
  }
}

async function saveJsonBin(snapshot) {
  if (!jsonBinId || !jsonBinKey) return;
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${jsonBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': jsonBinKey,
      },
      body: JSON.stringify(snapshot),
    });
  } catch (err) {
    console.warn('JSONBin persist failed:', err.message);
  }
}

async function loadWorld() {
  try {
    const raw = await readFile(worldFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (validWorld(parsed)) {
      world = mergeStarterWorld(parsed);
      if (!world.voters) world.voters = {};
      return;
    }
  } catch {
    /* no local snapshot yet */
  }
  const remote = await loadJsonBin();
  if (remote) {
    world = mergeStarterWorld(remote);
    if (!world.voters) world.voters = {};
    return;
  }
  world = seedWorld();
}

function schedulePersist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persist().catch((err) => console.warn('world persist failed:', err.message));
  }, 400);
}

async function persist() {
  const snapshot = cloneWorld(world);
  await mkdir(dataDir, { recursive: true });
  await writeFile(worldFile, JSON.stringify(snapshot));
  await saveJsonBin(snapshot);
}

export function bootWorld() {
  if (!ready) ready = loadWorld();
  return ready;
}

export function getPublicWorld() {
  return publicWorld(world);
}

export function addLiveClient(res) {
  clients.add(res);
  return () => clients.delete(res);
}

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
}

export function applyEvent(event) {
  const fp = eventFingerprint(event);
  if (fp && recent.has(fp) && event.type !== 'fight') return { ok: false, reason: 'duplicate' };
  if (event.type === 'fight') {
    if (!event.fight?.id) return { ok: false, reason: 'invalid' };
    broadcast(event);
    return { ok: true, liveOnly: true };
  }
  const changed = applySharedEvent(world, event);
  if (!changed) return { ok: false, reason: 'rejected' };
  if (fp) {
    recent.add(fp);
    setTimeout(() => recent.delete(fp), 60_000);
  }
  schedulePersist();
  broadcast(event);
  return { ok: true };
}
