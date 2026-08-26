// Small shared UI helpers. Every toast here is the result of something the user did.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function toast({ icon = '🚨', title, body, tone = 'info', ms = 4200 }) {
  const stack = $('#toastStack');
  if (!stack) return;
  const node = el(`<article class="toast ${tone}">
      <b>${icon} ${title}</b>
      ${body ? `<p>${body}</p>` : ''}
      <button class="toast-x" aria-label="Dismiss">×</button>
    </article>`);
  node.querySelector('.toast-x').onclick = () => node.remove();
  stack.append(node);
  setTimeout(() => {
    node.classList.add('out');
    setTimeout(() => node.remove(), 400);
  }, ms);
}

export function celebrate(levelUp, unlocked = []) {
  if (levelUp) toast({ icon: '🎖️', title: `CLEARANCE UPGRADED: ${levelUp.name}`, body: levelUp.note, tone: 'good', ms: 6000 });
  unlocked.filter(Boolean).forEach((a, i) =>
    setTimeout(() => toast({ icon: a.icon, title: `ACHIEVEMENT: ${a.name}`, body: a.note, tone: 'good', ms: 6000 }), 400 + i * 500),
  );
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function statBars(stats, keys, labels) {
  return keys
    .map(
      (k) => `<div class="bar-row"><span>${labels[k]}</span>
        <div class="bar"><b style="width:${stats[k] || 0}%"></b></div>
        <em>${stats[k] || 0}</em></div>`,
    )
    .join('');
}

export function wireDialogClose(dialog) {
  dialog.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => dialog.close()));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

export function shake(node) {
  node.classList.remove('shake');
  void node.offsetWidth;
  node.classList.add('shake');
}
