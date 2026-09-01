import { spawn } from 'node:child_process';

const base = process.env.LOADTEST_URL || 'https://chappri-spotter.vercel.app';

const jobs = [
  { path: '/', connections: 10, duration: 8, title: 'homepage' },
  { path: '/api/health', connections: 5, duration: 6, title: 'health' },
  { path: '/api/world', connections: 3, duration: 6, title: 'world API' },
];

function run(job) {
  return new Promise((resolve, reject) => {
    const url = `${base}${job.path}`;
    const args = ['autocannon@8', '-c', String(job.connections), '-d', String(job.duration), '-j', url];
    console.log(`\n=== ${job.title}: ${url} (${job.connections} conn, ${job.duration}s) ===`);
    const child = spawn('npx', args, { stdio: ['ignore', 'pipe', 'inherit'] });
    let out = '';
    child.stdout.on('data', (chunk) => {
      out += chunk;
    });
    child.on('exit', (code) => {
      if (code !== 0) return reject(new Error(`autocannon exited ${code} for ${url}`));
      try {
        const json = JSON.parse(out);
        console.log(`ok ${json['2xx'] || 0}  non-2xx ${json.non2xx || 0}  errors ${json.errors || 0}  timeouts ${json.timeouts || 0}`);
        console.log(`rps avg ${Math.round(json.requests?.average || 0)}  latency p50/p99 ${json.latency?.p50}ms / ${json.latency?.p99}ms`);
      } catch {
        process.stdout.write(out);
      }
      resolve();
    });
  });
}

for (const job of jobs) await run(job);
console.log('\nLoad test finished. Writes were not hammered so people data stays intact.');
