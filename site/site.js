// Pretotype page. Uses the real, tested scoring code from src/ on synthetic data.
// In memory only: no network, no storage (enforced by `npm run check`).
import { weeklyProgress } from '../src/progress.js';
import { buildShare, decodeShare, newSecret } from '../src/share.js';
import { groupBoard } from '../src/board.js';
import { myPlan, friendCodes, WEEK, GROUP } from '../demo/synthetic.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const NEXT = { done: 'missed', missed: 'unknown', unknown: null, null: 'done' };
const MARK = { done: '✓', missed: '✗', unknown: '?', null: '·' };
const ORB = { Moth: 'a', Fern: 'b', Heron: 'c', Badger: 'd', Otter: 'me' };

const secret = newSecret();
const plan = structuredClone(myPlan);
const friends = (await friendCodes()).map(decodeShare);

function renderWeek() {
  $('wk').textContent = WEEK;
  $('goals').replaceChildren(...plan.goals.map((g) => {
    const li = el('li');
    const cells = el('div', 'cells');
    g.opportunities.forEach((s, i) => {
      const b = el('button', `cell ${s ?? 'pending'}`, MARK[s]);
      b.setAttribute('aria-label', `${g.label}, day ${i + 1}: ${s ?? 'not yet'}`);
      b.onclick = () => { g.opportunities[i] = NEXT[s]; update(); };
      cells.append(b);
    });
    li.append(el('span', 'gl', g.label), cells);
    return li;
  }));
  const p = weeklyProgress(plan);
  $('pct').textContent = p.percent === null ? '—' : `${p.percent}%`;
  $('cnt').textContent = `${p.done} done · ${p.missed} missed · ${p.unknown} unknown${p.pending ? ` · ${p.pending} not yet` : ''}`;
  return p;
}

async function renderBoard(p) {
  const optIn = $('optin').checked;
  let mine = null;
  if (optIn && p.complete) mine = await buildShare({ plan, optIn: true, alias: 'Otter', groupId: GROUP, secret });
  $('share').textContent = !optIn ? 'Sharing is off. Nothing leaves this tab.'
    : !p.complete ? 'Finish the week first: mark every day (unknown is fine).'
    : JSON.stringify(mine, null, 1).replace(/\n\s*/g, ' ');
  const b = groupBoard(mine ? [...friends, mine] : friends, { groupId: GROUP, week: WEEK });
  $('together').textContent = b.together === null ? '—' : `${b.together}%`;

  // FLIP: animate rows to their new rank
  const list = $('rows');
  const first = new Map([...list.children].map((li) => [li.dataset.k, li.getBoundingClientRect().top]));
  list.replaceChildren(...b.rows.map((r) => {
    const li = el('li', mine && r.member_id === mine.member_id ? 'me' : '');
    li.dataset.k = r.alias;
    const bar = el('span', 'bar'); bar.style.setProperty('--w', `${r.progress_band}%`);
    li.append(el('span', 'rk mono', r.rank), el('span', `orb ${ORB[r.alias] ?? 'a'}`), el('span', 'al', r.alias), bar, el('span', 'pc mono', `${r.progress_band}%`));
    return li;
  }));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const li of list.children) {
      const was = first.get(li.dataset.k);
      if (was === undefined) { li.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }); continue; }
      const dy = was - li.getBoundingClientRect().top;
      if (dy) li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }
}

async function update() { await renderBoard(renderWeek()); }

$('optin').onchange = update;
document.querySelectorAll('.themes button').forEach((b) => b.addEventListener('click', () => {
  $('board').dataset.theme = b.dataset.t;
  document.querySelectorAll('.themes button').forEach((x) => x.classList.toggle('on', x === b));
}));
update();
