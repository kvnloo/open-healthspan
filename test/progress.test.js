import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weeklyProgress, validatePlan } from '../src/progress.js';

const plan = (goals, week = '2026-W47') => ({ week, goals });

test('unknown never counts as done or missed', () => {
  const p = weeklyProgress(plan([{ id: 'walk', opportunities: ['done', 'unknown', 'missed', 'unknown'] }]));
  assert.equal(p.percent, 50);
  assert.equal(p.unknown, 2);
  assert.equal(p.complete, true);
});

test('pending opportunities make the week incomplete', () => {
  const p = weeklyProgress(plan([{ id: 'walk', opportunities: ['done', null] }]));
  assert.equal(p.complete, false);
});

test('all-unknown week has no percent and is not complete', () => {
  const p = weeklyProgress(plan([{ id: 'sleep', opportunities: ['unknown', 'unknown'] }]));
  assert.equal(p.percent, null);
  assert.equal(p.complete, false);
});

test('planned rest is a goal and counts like any other', () => {
  const p = weeklyProgress(plan([
    { id: 'lift', opportunities: ['done', 'done'] },
    { id: 'rest-day', opportunities: ['done'] },
  ]));
  assert.equal(p.percent, 100);
});

test('progress is capped at 100', () => {
  const p = weeklyProgress(plan([{ id: 'a', opportunities: ['done', 'done', 'done'] }]));
  assert.ok(p.percent <= 100);
});

test('plans need 1-7 goals, unique ids, valid week and statuses', () => {
  assert.throws(() => validatePlan(plan([])));
  const eight = Array.from({ length: 8 }, (_, i) => ({ id: `g${i}`, opportunities: ['done'] }));
  assert.throws(() => validatePlan(plan(eight)));
  assert.throws(() => validatePlan(plan([{ id: 'a', opportunities: ['done'] }, { id: 'a', opportunities: ['done'] }])));
  assert.throws(() => validatePlan(plan([{ id: 'a', opportunities: ['done'] }], '2026-47')));
  assert.throws(() => validatePlan(plan([{ id: 'a', opportunities: ['crushed-it'] }])));
});
