export function computeChange({ current, previous }) {
  if (current === null || previous === null) return { kind: 'none' };
  if (current === previous) return { kind: 'flat' };
  if (previous === 0) return { kind: 'new' };

  return {
    kind: current > previous ? 'up' : 'down',
    ratio: Math.abs(current - previous) / previous,
  };
}

export function computeSuccessRate({ completed, failed }) {
  const finished = completed + failed;

  return finished === 0 ? null : completed / finished;
}

export function pairSuccessRate(kpis) {
  return {
    current: computeSuccessRate({
      completed: kpis.completed.current,
      failed: kpis.failed.current,
    }),
    previous: computeSuccessRate({
      completed: kpis.completed.previous,
      failed: kpis.failed.previous,
    }),
  };
}

export function sumBy(rows, key) {
  return rows.reduce((total, row) => total + row[key], 0);
}

export function humanizeKey(value) {
  const words = value.replaceAll('_', ' ').toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}
