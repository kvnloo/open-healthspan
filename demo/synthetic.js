// Synthetic, fictional data only. No real people, devices or measurements.
import { buildShare, encodeShare } from '../src/share.js';

export const WEEK = '2026-W47';
export const GROUP = 'tuesday-crew';

export const myPlan = {
  week: WEEK,
  goals: [
    { id: 'walk', label: '30 min walk', opportunities: ['done', 'done', 'missed', 'done', 'unknown'] },
    { id: 'lights-out', label: 'Lights out by 23:00', opportunities: ['done', 'missed', 'done', 'done', 'done', 'missed', 'done'] },
    { id: 'rest', label: 'Planned rest day', opportunities: ['done'] },
    { id: 'veg', label: 'Vegetables at dinner', opportunities: ['done', 'done', 'unknown', 'done', 'done'] },
  ],
};

const friends = [
  ['Heron', 11, ['done', 'done', 'done', 'missed', 'done', 'done']],
  ['Badger', 12, ['done', 'missed', 'missed', 'done']],
  ['Moth', 13, ['done', 'done', 'done', 'done']],
  ['Fern', 14, ['unknown', 'done', 'missed', 'done', 'done', 'unknown', 'done']],
];

export async function friendCodes() {
  const codes = [];
  for (const [alias, seed, ops] of friends) {
    const s = await buildShare({
      plan: { week: WEEK, goals: [{ id: 'g', opportunities: ops }] },
      optIn: true, alias, groupId: GROUP, secret: new Uint8Array(32).fill(seed),
    });
    codes.push(encodeShare(s));
  }
  return codes;
}
