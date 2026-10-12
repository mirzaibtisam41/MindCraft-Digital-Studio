function formatValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
}

export function describeChanges(changes) {
  return Object.entries(changes ?? {}).map(([field, value]) => {
    const isDiff =
      value && typeof value === 'object' && 'from' in value && 'to' in value;

    return isDiff
      ? `${field}: ${formatValue(value.from)} → ${formatValue(value.to)}`
      : `${field}: ${formatValue(value)}`;
  });
}
