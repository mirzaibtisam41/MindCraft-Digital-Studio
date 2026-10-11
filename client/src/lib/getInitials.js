const MAX_INITIALS = 2;

export function getInitials(name) {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '?';

  return words
    .slice(0, MAX_INITIALS)
    .map((word) => Array.from(word)[0].toUpperCase())
    .join('');
}
