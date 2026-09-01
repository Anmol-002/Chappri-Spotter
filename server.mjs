import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addLiveClient, applyEvent, bootWorld, getPublicWorld } from './world-store.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), 'public');
const types = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
};

const MAX_BODY = 48 * 1024;

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = normalize(join(root, requested));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    return send(res, 404, 'Signal lost: asset not found.');
  }
  const kind = extname(file);
  res.writeHead(200, {
    'Content-Type': types[kind] || 'application/octet-stream',
    'Cache-Control': kind === '.png' || kind === '.mp3' ? 'public, max-age=86400' : 'no-cache',
  });
  createReadStream(file).pipe(res);
}

await bootWorld();

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/api/world') {
    return send(res, 200, await getPublicWorld());
  }

  if (req.method === 'GET' && url.pathname === '/api/live') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    res.write(':\n\n');
    const drop = addLiveClient(res);
    req.on('close', drop);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/event') {
    try {
      const event = await readJson(req);
      const result = await applyEvent(event);
      return send(res, result.ok ? 200 : 409, result);
    } catch (err) {
      return send(res, 400, { ok: false, reason: err.message || 'bad request' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed.');
  }

  serveStatic(req, res, url);
}).listen(process.env.PORT || 4173, process.env.HOST || '0.0.0.0', () =>
  console.log(`Chappri Spotter running at http://localhost:${process.env.PORT || 4173}`),
);
