// Weekly plan progress (RFC 0002). Pure, local-only, no I/O.
//
// A plan is 1-7 user-chosen goals for one ISO week. Each goal has a list of
// opportunities; each opportunity is 'done', 'missed', 'unknown' or null
// (not yet resolved). Planned rest is just a goal like any other.

export const STATUSES = Object.freeze(['done', 'missed', 'unknown']);
export const WEEK_RE = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;

export function validatePlan(plan) {
  if (!plan || typeof plan !== 'object') throw new TypeError('plan must be an object');
  if (!WEEK_RE.test(plan.week ?? '')) throw new RangeError('week must be ISO week like 2026-W47');
  const goals = plan.goals;
  if (!Array.isArray(goals) || goals.length < 1 || goals.length > 7) {
    throw new RangeError('a weekly plan has 1-7 goals');
  }
  const ids = new Set();
  for (const g of goals) {
    if (typeof g.id !== 'string' || !g.id) throw new TypeError('goal id required');
    if (ids.has(g.id)) throw new RangeError(`duplicate goal id ${g.id}`);
    ids.add(g.id);
    if (!Array.isArray(g.opportunities) || g.opportunities.length < 1 || g.opportunities.length > 7) {
      throw new RangeError('each goal has 1-7 opportunities');
    }
    for (const s of g.opportunities) {
      if (s !== null && !STATUSES.includes(s)) throw new RangeError(`bad status ${s}`);
    }
  }
  return plan;
}

// Counts plus a 0-100 completion. Unknown never counts as done or missed.
export function weeklyProgress(plan) {
  validatePlan(plan);
  let done = 0, missed = 0, unknown = 0, pending = 0;
  for (const g of plan.goals) {
    for (const s of g.opportunities) {
      if (s === 'done') done++;
      else if (s === 'missed') missed++;
      else if (s === 'unknown') unknown++;
      else pending++;
    }
  }
  const resolved = done + missed;
  const complete = pending === 0 && resolved > 0;
  const percent = resolved === 0 ? null : Math.min(100, Math.round((done / resolved) * 100));
  return { done, missed, unknown, pending, complete, percent };
}
