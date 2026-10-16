const UNITS = [
  { unit: 'year', seconds: 365 * 24 * 60 * 60 },
  { unit: 'month', seconds: 30 * 24 * 60 * 60 },
  { unit: 'week', seconds: 7 * 24 * 60 * 60 },
  { unit: 'day', seconds: 24 * 60 * 60 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
];

const relativeFormat = new Intl.RelativeTimeFormat(undefined, {
  numeric: 'auto',
});

export function formatTimeAgo(value) {
  const secondsAgo = (Date.now() - new Date(value).getTime()) / 1000;
  const match = UNITS.find((item) => secondsAgo >= item.seconds);

  if (!match) return 'just now';

  return relativeFormat.format(
    -Math.floor(secondsAgo / match.seconds),
    match.unit,
  );
}
