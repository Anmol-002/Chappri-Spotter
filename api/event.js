import { applyEvent } from '../world-store.mjs';

function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, reason: 'method not allowed' });
  }
  try {
    const result = await applyEvent(readBody(req));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(result.ok ? 200 : 409).json(result);
  } catch (err) {
    return res.status(400).json({ ok: false, reason: err.message || 'bad request' });
  }
}
