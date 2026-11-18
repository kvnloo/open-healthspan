// Private group board (RFC 0002). Built locally from share codes friends
// paste to each other; there is no server. Groups and weeks never mix.

import { validateShare } from './share.js';

export function groupBoard(shares, { groupId, week }) {
  const latest = new Map();
  const rejected = [];
  for (const raw of shares) {
    let s;
    try { s = validateShare(raw); } catch (e) { rejected.push(e.message); continue; }
    if (s.group_id !== groupId || s.week !== week) continue;
    latest.set(s.member_id, s); // dedupe: one row per member, last one wins
  }
  const rows = [...latest.values()]
    .map((s) => ({ ...s }))
    .sort((a, b) => b.progress_band - a.progress_band || a.alias.localeCompare(b.alias));
  let rank = 0, prev = null;
  rows.forEach((r, i) => {
    if (r.progress_band !== prev) { rank = i + 1; prev = r.progress_band; }
    r.rank = rank; // ties share a rank
  });
  // Cooperative number first: how the group did together, also banded.
  const together = rows.length
    ? Math.floor(rows.reduce((t, r) => t + r.progress_band, 0) / rows.length / 5) * 5
    : null;
  return { groupId, week, rows, together, rejected };
}
