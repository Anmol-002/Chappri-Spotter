export default async function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}
