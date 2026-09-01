import { getPublicWorld } from '../world-store.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, reason: 'method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(await getPublicWorld());
}
