const base = process.env.LOADTEST_URL || 'http://127.0.0.1:4173';

function fight(n) {
  return {
    type: 'fight',
    fight: {
      id: `test-fight-${n}-${Date.now()}`,
      a: 'cp',
      b: 'hauzkhas',
      winner: 'cp',
      at: Date.now(),
      expiresAt: Date.now() + 45_000,
      rounds: [{ stat: 'chaos', winner: 'cp' }],
    },
  };
}

const seen = [];
const live = await fetch(`${base}/api/live`);
if (live.status !== 200) {
  throw new Error(`observer SSE failed: ${live.status}`);
}
const reader = live.body.getReader();
const dec = new TextDecoder();
let buf = '';
const watch = (async () => {
  while (seen.length < 4) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    for (const block of buf.split('\n\n')) {
      const line = block.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const event = JSON.parse(line.slice(6));
      if (event.type === 'fight') seen.push(event.fight.id);
    }
    buf = buf.includes('\n\n') ? buf.slice(buf.lastIndexOf('\n\n') + 2) : buf;
  }
})();

for (let n = 1; n <= 4; n += 1) {
  const res = await fetch(`${base}/api/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fight(n)),
  });
  if (!res.ok) throw new Error(`fight ${n} rejected: ${res.status}`);
}

await Promise.race([watch, new Promise((_, reject) => setTimeout(() => reject(new Error('SSE timeout')), 4000))]);
reader.cancel().catch(() => {});

const world = await (await fetch(`${base}/api/world`)).json();
const queued = (world.liveFights || []).filter((f) => String(f.id).startsWith('test-fight-'));
console.log(JSON.stringify({ sse: seen.length, queued: queued.length, liveFight: world.liveFight?.id || null }, null, 2));
if (seen.length < 4 || queued.length < 4) process.exit(1);
