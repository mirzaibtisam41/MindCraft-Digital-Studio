export function formatCredits(amount) {
  return `${amount} ${amount === 1 ? 'credit' : 'credits'}`;
}

export function estimateCost({ model, quality, count }) {
  const perImage = model?.creditsPerImage?.[quality];

  if (perImage === undefined) return null;

  return { perImage, total: perImage * count };
}
