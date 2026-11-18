import { weeklyProgress } from '../src/progress.js';
import { buildShare, encodeShare, decodeShare, newSecret } from '../src/share.js';
import { groupBoard } from '../src/board.js';
import { myPlan, friendCodes, WEEK, GROUP } from './synthetic.js';

// In memory only: reload = new secret, nothing persisted (RFC 0003).
const secret = newSecret();
const plan = structuredClone(myPlan);
const $ = (id) => document.getElementById(id);
const NEXT = { done: 'missed', missed: 'unknown', unknown: null, null: 'done' };
const LABEL = { done: '✓', missed: '✗', unknown: '?', null: '·' };

function renderPlan() {
  $('week').textContent = WEEK;
  $('goals').replaceChildren(...plan.goals.map((g) => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = g.label;
    const cells = g.opportunities.map((s, i) => {
      const b = document.createElement('button');
      b.className = `cell ${s ?? 'pending'}`;
      b.textContent = LABEL[s];
      b.title = `${s ?? 'not yet'} (click to change)`;
      b.onclick = () => { g.opportunities[i] = NEXT[s]; update(); };
      return b;
    });
    const row = document.createElement('div');
    row.className = 'cells';
    row.append(...cells);
    li.append(name, row);
    return li;
  }));
  const p = weeklyProgress(plan);
  $('progress').textContent = p.percent === null ? '—' : `${p.percent}%`;
  $('counts').textContent = `${p.done} done · ${p.missed} missed · ${p.unknown} unknown (not counted) · ${p.pending} not yet`;
}

async function renderShare() {
  const s = await buildShare({
    plan, optIn: $('optin').checked, alias: $('alias').value.trim(), groupId: GROUP, secret,
  }).catch((e) => ({ error: e.message }));
  const p = weeklyProgress(plan);
  if (!$('optin').checked) $('preview').textContent = 'Sharing is off. Nothing leaves this page.';
  else if (!p.complete) $('preview').textContent = 'Week not finished: mark every opportunity (unknown is fine) to share.';
  else if (s?.error) $('preview').textContent = s.error;
  else $('preview').textContent = JSON.stringify(s, null, 2);
  $('code').value = s && !s.error ? encodeShare(s) : '';
  return s && !s.error ? s : null;
}

async function update() {
  renderPlan();
  const mine = await renderShare();
  const shares = [];
  const bad = [];
  for (const line of $('friends').value.split(/\s+/).filter(Boolean)) {
    try { shares.push(decodeShare(line)); } catch (e) { bad.push(e.message); }
  }
  if (mine) shares.push(mine);
  const b = groupBoard(shares, { groupId: GROUP, week: WEEK });
  $('together').textContent = b.together === null ? '—' : `${b.together}%`;
  $('board').replaceChildren(...b.rows.map((r) => {
    const tr = document.createElement('tr');
    if (mine && r.member_id === mine.member_id) tr.className = 'me';
    for (const v of [r.rank, r.alias, `${r.progress_band}%`, r.goals_planned]) {
      const td = document.createElement('td');
      td.textContent = v;
      tr.append(td);
    }
    return tr;
  }));
  $('rejected').textContent = [...bad, ...b.rejected].length ? `Ignored ${[...bad, ...b.rejected].length} invalid code(s).` : '';
}

$('optin').onchange = update;
$('alias').oninput = update;
$('friends').oninput = update;
$('copy').onclick = () => { $('code').select(); navigator.clipboard?.writeText($('code').value); };
$('friends').value = (await friendCodes()).join('\n');
update();
