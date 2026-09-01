import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySharedEvent, eventFingerprint, liveFightsOf, mergeStarterWorld, publicWorld, rememberLiveFight, seedWorld } from './public/js/world.js';

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.CHAPPRI_STORE_PATH || join(root, 'data');
const worldFile = join(dataDir, 'world.json');
const jsonBinId = process.env.JSONBIN_BIN_ID || '';
const jsonBinKey = process.env.JSONBIN_API_KEY || '';
const gistId = process.env.CHAPPRI_GIST_ID || '';
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const serverless = Boolean(process.env.VERCEL);

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

function adopt(parsed) {
  world = mergeStarterWorld(parsed);
  if (!world.voters) world.voters = {};
}

async function loadGist() {
  if (!gistId || !githubToken) return null;
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubToken}`,
      'User-Agent': 'chappri-spotter',
    },
  });
  if (!res.ok) return null;
  const gist = await res.json();
  const raw = gist.files?.['world.json']?.content;
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return validWorld(parsed) ? parsed : null;
}

async function saveGist(snapshot) {
  if (!gistId || !githubToken) return false;
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'chappri-spotter',
    },
    body: JSON.stringify({
      files: { 'world.json': { content: JSON.stringify(snapshot) } },
    }),
  });
  if (!res.ok) {
    console.warn('Gist persist failed:', res.status);
    return false;
  }
  return true;
}

async function loadKv() {
  if (!kvUrl || !kvToken) return null;
  const res = await fetch(`${kvUrl}/get/chappri-world`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.result) return null;
  const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
  return validWorld(parsed) ? parsed : null;
}

async function saveKv(snapshot) {
  if (!kvUrl || !kvToken) return false;
  const res = await fetch(`${kvUrl}/set/chappri-world`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kvToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snapshot),
  });
  return res.ok;
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
  if (!jsonBinId || !jsonBinKey) return false;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': jsonBinKey,
      },
      body: JSON.stringify(snapshot),
    });
    return res.ok;
  } catch (err) {
    console.warn('JSONBin persist failed:', err.message);
    return false;
  }
}

async function loadFile() {
  try {
    const raw = await readFile(worldFile, 'utf8');
    const parsed = JSON.parse(raw);
    return validWorld(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function saveFile(snapshot) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(worldFile, JSON.stringify(snapshot));
}

async function loadRemote() {
  return (await loadGist()) || (await loadKv()) || (await loadJsonBin()) || (await loadFile());
}

let loadedAt = 0;

async function refreshWorld() {
  if (serverless && Date.now() - loadedAt < 2500 && world?.territories?.length) return;
  const remote = await loadRemote();
  if (remote) adopt(remote);
  else if (!world?.territories?.length) world = seedWorld();
  if (!world.voters) world.voters = {};
  loadedAt = Date.now();
}

async function persist() {
  const snapshot = cloneWorld(world);
  const writes = [];
  if (gistId && githubToken) writes.push(saveGist(snapshot));
  if (kvUrl && kvToken) writes.push(saveKv(snapshot));
  if (jsonBinId && jsonBinKey) writes.push(saveJsonBin(snapshot));
  if (!serverless) writes.push(saveFile(snapshot));
  if (!writes.length) writes.push(saveFile(snapshot));
  await Promise.all(writes);
  loadedAt = Date.now();
}

async function schedulePersist() {
  if (serverless) {
    await persist();
    return;
  }
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persist().catch((err) => console.warn('world persist failed:', err.message));
  }, 250);
}

function hasDurableStore() {
  return Boolean((gistId && githubToken) || (kvUrl && kvToken) || (jsonBinId && jsonBinKey));
}

export function bootWorld() {
  if (!ready) {
    ready = refreshWorld().then(() => {
      if (serverless && !hasDurableStore()) {
        console.warn('No durable store (CHAPPRI_GIST_ID + GITHUB_TOKEN). Posts will not survive deploys.');
      }
      // Never persist on boot: a failed remote load must not overwrite the gist with seed data.
      if (!serverless) return persist().catch((err) => console.warn('initial persist failed:', err.message));
    });
  }
  return ready;
}

export async function getPublicWorld() {
  if (serverless) await refreshWorld();
  else await bootWorld();
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

process.on?.('SIGTERM', () => {
  persist().catch(() => {});
});
process.on?.('SIGINT', () => {
  persist().catch(() => {});
});

export async function applyEvent(event) {
  const heldFights = liveFightsOf(world);
  if (serverless) {
    loadedAt = 0;
    await refreshWorld();
  } else await bootWorld();

  const fp = eventFingerprint(event);
  if (fp && recent.has(fp) && event.type !== 'fight') return { ok: false, reason: 'duplicate' };
  if (event.type === 'fight') {
    if (!event.fight?.id) return { ok: false, reason: 'invalid' };
    world.liveFights = liveFightsOf({
      liveFights: [...heldFights, ...(world.liveFights || [])],
      liveFight: world.liveFight,
    });
    rememberLiveFight(world, event.fight);
    broadcast(event);
    schedulePersist().catch((err) => console.warn('live fight persist failed:', err.message));
    return { ok: true, liveOnly: true };
  }
  const changed = applySharedEvent(world, event);
  if (!changed) return { ok: false, reason: 'rejected' };
  if (fp) {
    recent.add(fp);
    setTimeout(() => recent.delete(fp), 60_000);
  }
  await schedulePersist();
  broadcast(event);
  return { ok: true };
}
