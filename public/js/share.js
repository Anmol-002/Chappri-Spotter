// Shareable dossier card, drawn on canvas so it can be downloaded as an image.
import { CHARACTERS, LAYERS } from './data.js';
import { bandFor, characterFor, territoryById, vibeScore } from './state.js';
import { $, toast } from './ui.js';

let shareText = '';

const rounded = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

export function openShareCard(territoryId) {
  const t = territoryById(territoryId);
  if (!t) return;
  const canvas = $('#shareCanvas');
  const ctx = canvas.getContext('2d');
  const score = vibeScore(t);
  const band = bandFor(score);
  const rows = LAYERS.filter((l) => l.key !== 'npc')
    .map((l) => ({ label: l.label, emoji: l.emoji, value: t.stats[l.key] || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  ctx.fillStyle = '#070c0b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const glow = ctx.createRadialGradient(700, 180, 40, 700, 180, 780);
  glow.addColorStop(0, `${band.color}44`);
  glow.addColorStop(1, '#070c0b00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#26332f';
  ctx.lineWidth = 2;
  rounded(ctx, 24, 24, canvas.width - 48, canvas.height - 48, 8);
  ctx.stroke();

  ctx.fillStyle = '#d3ff36';
  ctx.font = '600 26px "DM Mono", monospace';
  ctx.fillText('CHAPPRI SPOTTER™', 64, 100);
  ctx.fillStyle = '#7c8a88';
  ctx.font = '18px "DM Mono", monospace';
  ctx.fillText('NCR VIBE INTELLIGENCE NETWORK · CLASSIFIED', 64, 132);

  ctx.fillStyle = '#f2f6f4';
  ctx.font = '700 62px "Space Grotesk", sans-serif';
  ctx.fillText(t.name.toUpperCase().slice(0, 18), 64, 240);
  ctx.fillStyle = '#7c8a88';
  ctx.font = '20px "DM Mono", monospace';
  ctx.fillText(`${t.zone} · ${t.reports || 0} FIELD REPORTS`, 64, 276);

  ctx.fillStyle = band.color;
  ctx.font = '700 200px "DM Mono", monospace';
  ctx.fillText(String(score), 56, 470);
  ctx.font = '700 34px "DM Mono", monospace';
  ctx.fillText('/100', 60 + ctx.measureText(String(score)).width * 2.6, 470);

  ctx.font = '700 34px "Space Grotesk", sans-serif';
  ctx.fillText(`${band.icon} ${band.label}`, 64, 530);
  ctx.fillStyle = '#96a3a0';
  ctx.font = '22px "Space Grotesk", sans-serif';
  ctx.fillText(band.note, 64, 566);

  rows.forEach((row, i) => {
    const y = 650 + i * 74;
    ctx.fillStyle = '#c9d4d1';
    ctx.font = '22px "Space Grotesk", sans-serif';
    ctx.fillText(`${row.emoji} ${row.label}`, 64, y);
    ctx.fillStyle = '#1b2422';
    rounded(ctx, 64, y + 14, 560, 14, 7);
    ctx.fill();
    ctx.fillStyle = band.color;
    rounded(ctx, 64, y + 14, Math.max(8, 560 * (row.value / 100)), 14, 7);
    ctx.fill();
    ctx.fillStyle = '#f2f6f4';
    ctx.font = '600 24px "DM Mono", monospace';
    ctx.fillText(String(row.value), 646, y + 28);
  });

  ctx.fillStyle = '#59665f';
  ctx.font = '18px "DM Mono", monospace';
  ctx.fillText('DATA COLLECTED BY ABSOLUTELY SERIOUS SCIENTISTS.', 64, canvas.height - 78);
  ctx.fillStyle = '#d3ff36';
  ctx.font = '600 20px "DM Mono", monospace';
  ctx.fillText('VIEW THE LIVE MAP →', 64, canvas.height - 48);

  const img = new Image();
  img.onload = () => {
    const h = 420;
    const w = (img.width / img.height) * h;
    ctx.drawImage(img, canvas.width - w - 30, canvas.height - h - 90, w, h);
  };
  img.src = CHARACTERS[characterFor(t)].file;

  shareText = [
    '🚨 CHAPPRI SPOTTER™',
    `${t.name.toUpperCase()} — VIBE INDEX ${score}/100`,
    ...rows.map((r) => `${r.emoji} ${r.label}: ${r.value}`),
    `${band.icon} ${band.label}`,
    'Data collected by absolutely serious scientists.',
  ].join('\n');

  const dialog = $('#shareDialog');
  dialog.showModal();
  $('#shareDownload').onclick = () =>
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `chappri-spotter-${t.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  $('#shareCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast({ icon: '📋', title: 'DOSSIER COPIED', body: 'Paste it anywhere. Ruin a group chat.', tone: 'good' });
    } catch {
      toast({ icon: '🙃', title: 'CLIPBOARD REFUSED', body: 'Your browser said no. Download the card instead.' });
    }
  };
}
