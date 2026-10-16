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

export function formatUpdatedAgo(value) {
  const secondsAgo = (Date.now() - new Date(value).getTime()) / 1000;
  const match = UNITS.find((item) => secondsAgo >= item.seconds);

  if (!match) return 'updated just now';

  return `updated ${relativeFormat.format(-Math.floor(secondsAgo / match.seconds), match.unit)}`;
}

export function describeProjectCounts(project) {
  const images = `${project.imageCount} ${project.imageCount === 1 ? 'image' : 'images'}`;
  const collections = `${project.collectionCount} ${project.collectionCount === 1 ? 'collection' : 'collections'}`;

  return `${images} · ${collections} · ${formatUpdatedAgo(project.updatedAt)}`;
}
