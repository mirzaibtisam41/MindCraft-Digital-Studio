const ALLOWED_PREFIXES = ['/app', '/admin'];

export function getSafeNextPath(value, fallback = '/app') {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;

  const allowed = ALLOWED_PREFIXES.some(
    (prefix) =>
      value === prefix ||
      value.startsWith(`${prefix}/`) ||
      value.startsWith(`${prefix}?`),
  );

  return allowed ? value : fallback;
}

export function buildLoginPath(next) {
  const safeNext = getSafeNextPath(next, null);

  if (!safeNext || safeNext === '/app') return '/login';

  return `/login?next=${encodeURIComponent(safeNext)}`;
}

export function readNextPathFromLocation(fallback = '/app') {
  if (typeof window === 'undefined') return fallback;

  return getSafeNextPath(
    new URLSearchParams(window.location.search).get('next'),
    fallback,
  );
}
