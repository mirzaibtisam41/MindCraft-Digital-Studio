function escapeForRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitByPhrases(text, phrases) {
  const usable = phrases.filter(Boolean);

  if (usable.length === 0) return [{ text, isMatch: false }];

  const pattern = new RegExp(
    `(${usable
      .sort((first, second) => second.length - first.length)
      .map(escapeForRegex)
      .join('|')})`,
    'gi',
  );

  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      isMatch: usable.some(
        (phrase) => phrase.toLowerCase() === part.toLowerCase(),
      ),
    }));
}

export function splitByPlaceholders(text) {
  return text
    .split(/(\[[^\]]+\])/g)
    .filter(Boolean)
    .map((part) => ({ text: part, isMatch: /^\[[^\]]+\]$/.test(part) }));
}
