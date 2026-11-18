import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildShare, validateShare, encodeShare, decodeShare, memberId, progressBand, SHARE_FIELDS,
} from '../src/share.js';

const secret = new Uint8Array(32).fill(7);
const plan = { week: '2026-W47', goals: [{ id: 'walk', opportunities: ['done', 'done', 'missed', 'unknown'] }] };
const args = { plan, optIn: true, alias: 'Otter', groupId: 'tuesday-crew', secret };

test('default share is null: no opt-in, no share', async () => {
  assert.equal(await buildShare({ ...args, optIn: undefined }), null);
  assert.equal(await buildShare({ ...args, optIn: 'yes' }), null);
});

test('incomplete week produces no share', async () => {
  const open = { ...plan, goals: [{ id: 'walk', opportunities: ['done', null] }] };
  assert.equal(await buildShare({ ...args, plan: open }), null);
});

test('share has exactly the seven allowlisted fields and no day-level data', async () => {
  const s = await buildShare(args);
  assert.deepEqual(Object.keys(s).sort(), [...SHARE_FIELDS].sort());
  assert.equal(SHARE_FIELDS.length, 7);
  assert.ok(!JSON.stringify(s).includes('opportunities'));
  assert.equal(s.progress_band, 65); // 2/3 = 67% -> 65 band
});

test('progress band floors to 5-point buckets and caps', () => {
  assert.equal(progressBand(67), 65);
  assert.equal(progressBand(100), 100);
  assert.equal(progressBand(140), 100);
  assert.equal(progressBand(-3), 0);
  assert.equal(progressBand(null), null);
});

test('member id is stable per group and unlinkable across groups', async () => {
  const a1 = await memberId(secret, 'tuesday-crew');
  const a2 = await memberId(secret, 'tuesday-crew');
  const b = await memberId(secret, 'work-friends');
  const other = await memberId(new Uint8Array(32).fill(8), 'tuesday-crew');
  assert.equal(a1, a2);
  assert.notEqual(a1, b);
  assert.notEqual(a1, other);
  assert.match(a1, /^[0-9a-f]{16}$/);
});

test('received shares reject extra health fields and bad values', async () => {
  const s = await buildShare(args);
  assert.throws(() => validateShare({ ...s, hrv_ms: 62 }));
  assert.throws(() => validateShare({ ...s, progress_band: 101 }));
  assert.throws(() => validateShare({ ...s, progress_band: 63 }));
  assert.throws(() => validateShare({ ...s, alias: '<script>' }));
  const { alias, ...missing } = s;
  assert.throws(() => validateShare(missing));
});

test('share code round-trips and rejects tampering', async () => {
  const s = await buildShare(args);
  const code = encodeShare(s);
  assert.match(code, /^ohs1\.[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeShare(code), s);
  const forged = 'ohs1.' + Buffer.from(JSON.stringify({ ...s, vo2max: 55 })).toString('base64url');
  assert.throws(() => decodeShare(forged));
  assert.throws(() => decodeShare('hello'));
});

test('unicode aliases survive the share code', async () => {
  const s = await buildShare({ ...args, alias: 'Léa 跑步' });
  assert.equal(decodeShare(encodeShare(s)).alias, 'Léa 跑步');
});
