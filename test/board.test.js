import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupBoard } from '../src/board.js';
import { buildShare } from '../src/share.js';

const mk = async (alias, ops, { groupId = 'tuesday-crew', week = '2026-W47', seed = alias.length } = {}) =>
  buildShare({
    plan: { week, goals: [{ id: 'g', opportunities: ops }] },
    optIn: true, alias, groupId, secret: new Uint8Array(32).fill(seed),
  });

test('board ranks by band, ties share a rank, cooperative total first', async () => {
  const shares = [
    await mk('Ana', ['done', 'done'], { seed: 1 }),
    await mk('Ben', ['done', 'missed'], { seed: 2 }),
    await mk('Cy', ['done', 'done'], { seed: 3 }),
  ];
  const b = groupBoard(shares, { groupId: 'tuesday-crew', week: '2026-W47' });
  assert.deepEqual(b.rows.map((r) => [r.alias, r.rank]), [['Ana', 1], ['Cy', 1], ['Ben', 3]]);
  assert.equal(b.together, 80); // (100+100+50)/3 = 83 -> 80
});

test('groups and weeks are isolated', async () => {
  const shares = [
    await mk('Ana', ['done'], { seed: 1 }),
    await mk('Ana', ['done'], { seed: 1, groupId: 'work-friends' }),
    await mk('Ana', ['done'], { seed: 1, week: '2026-W46' }),
  ];
  const b = groupBoard(shares, { groupId: 'tuesday-crew', week: '2026-W47' });
  assert.equal(b.rows.length, 1);
});

test('duplicate member entries collapse to the latest', async () => {
  const shares = [await mk('Ana', ['missed'], { seed: 1 }), await mk('Ana', ['done'], { seed: 1 })];
  const b = groupBoard(shares, { groupId: 'tuesday-crew', week: '2026-W47' });
  assert.equal(b.rows.length, 1);
  assert.equal(b.rows[0].progress_band, 100);
});

test('invalid entries are rejected, not ranked', async () => {
  const ok = await mk('Ana', ['done'], { seed: 1 });
  const b = groupBoard([ok, { ...ok, member_id: 'f'.repeat(16), steps: 20000 }], { groupId: 'tuesday-crew', week: '2026-W47' });
  assert.equal(b.rows.length, 1);
  assert.equal(b.rejected.length, 1);
});

test('empty board has no cooperative total', () => {
  assert.equal(groupBoard([], { groupId: 'tuesday-crew', week: '2026-W47' }).together, null);
});
