const integerFormatter = new Intl.NumberFormat('en-US');

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatNumber(value) {
  return integerFormatter.format(value ?? 0);
}

export function formatCompact(value) {
  return compactFormatter.format(value ?? 0);
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(value) {
  return usdFormatter.format(value ?? 0);
}

export function formatPercent(value, fractionDigits = 1) {
  if (value === null || value === undefined) return '—';

  return `${(value * 100).toFixed(fractionDigits).replace(/\.0+$/, '')}%`;
}

export function formatDuration(milliseconds) {
  if (milliseconds === null || milliseconds === undefined) return '—';
  if (milliseconds < 1000) return `${milliseconds} ms`;

  const seconds = milliseconds / 1000;

  if (seconds < 60) return `${seconds.toFixed(1).replace(/\.0$/, '')} s`;

  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

export function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
}
