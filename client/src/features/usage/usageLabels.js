export const FEATURE_LABELS = {
  text_to_image: 'Generation',
  image_to_image: 'Image to Image',
  image_edit: 'Editing',
  vision: 'AI Vision',
};

export function formatMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);

  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthNumber - 1, 1));
}

export function shiftMonth(month, offset) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function percentChange(current, previous) {
  if (!previous) return null;

  return Math.round(((current - previous) / previous) * 100);
}
