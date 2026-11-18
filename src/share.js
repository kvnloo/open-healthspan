// Obfuscated, opt-in weekly share (RFC 0002 + 0003).
//
// The share is the ONLY thing that ever leaves a device. It carries no
// measurements, no day-level data and no stable identity:
//  - member_id is HMAC(device secret, group_id): stable inside one group,
//    unlinkable across groups without the secret.
//  - progress_band floors completion to a 5-point bucket (0, 5, ... 100).
// This is pseudonymous, NOT anonymous: friends who know your alias know it's you.

import { weeklyProgress, WEEK_RE } from './progress.js';

export const SCHEMA = 'ohs.share.v1';
export const SHARE_FIELDS = Object.freeze([
  'schema', 'group_id', 'member_id', 'alias', 'week', 'goals_planned', 'progress_band',
]);
const ALIAS_RE = /^[\p{L}\p{N} _.-]{1,24}$/u;
const GROUP_RE = /^[a-z0-9-]{3,40}$/;

export function progressBand(percent) {
  if (percent === null || !Number.isFinite(percent)) return null;
  return Math.floor(Math.max(0, Math.min(100, percent)) / 5) * 5;
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function memberId(secret, groupId) {
  if (!(secret instanceof Uint8Array) || secret.length < 16) throw new TypeError('secret must be >=16 random bytes');
  const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`ohs-member:${groupId}`));
  return hex(mac).slice(0, 16);
}

export const newSecret = () => crypto.getRandomValues(new Uint8Array(32));

// null unless the user opted in AND the week is fully resolved.
export async function buildShare({ plan, optIn = false, alias, groupId, secret }) {
  if (optIn !== true) return null;
  const p = weeklyProgress(plan);
  if (!p.complete) return null;
  if (!ALIAS_RE.test(alias ?? '')) throw new RangeError('alias: 1-24 letters, digits, space, _ . -');
  if (!GROUP_RE.test(groupId ?? '')) throw new RangeError('group_id: 3-40 of a-z 0-9 -');
  return {
    schema: SCHEMA,
    group_id: groupId,
    member_id: await memberId(secret, groupId),
    alias,
    week: plan.week,
    goals_planned: plan.goals.length,
    progress_band: progressBand(p.percent),
  };
}

// Strict allowlist check for anything received from someone else.
export function validateShare(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) throw new TypeError('share must be an object');
  const keys = Object.keys(s).sort();
  const want = [...SHARE_FIELDS].sort();
  if (keys.length !== want.length || keys.some((k, i) => k !== want[i])) {
    throw new RangeError(`share must have exactly: ${SHARE_FIELDS.join(', ')}`);
  }
  if (s.schema !== SCHEMA) throw new RangeError('unknown schema');
  if (!GROUP_RE.test(s.group_id)) throw new RangeError('bad group_id');
  if (!/^[0-9a-f]{16}$/.test(s.member_id)) throw new RangeError('bad member_id');
  if (typeof s.alias !== 'string' || !ALIAS_RE.test(s.alias)) throw new RangeError('bad alias');
  if (!WEEK_RE.test(s.week)) throw new RangeError('bad week');
  if (!Number.isInteger(s.goals_planned) || s.goals_planned < 1 || s.goals_planned > 7) throw new RangeError('bad goals_planned');
  if (!Number.isInteger(s.progress_band) || s.progress_band < 0 || s.progress_band > 100 || s.progress_band % 5) {
    throw new RangeError('bad progress_band');
  }
  return s;
}

// Share code: one copy-pasteable string for any chat app. Encoding, not encryption.
const toB64Url = (str) => btoa(String.fromCharCode(...new TextEncoder().encode(str)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64Url = (b) => new TextDecoder().decode(
  Uint8Array.from(atob(b.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

export function encodeShare(s) {
  validateShare(s);
  return 'ohs1.' + toB64Url(JSON.stringify(s));
}

export function decodeShare(code) {
  if (typeof code !== 'string' || !code.startsWith('ohs1.')) throw new RangeError('not an ohs1 share code');
  return validateShare(JSON.parse(fromB64Url(code.slice(5))));
}
