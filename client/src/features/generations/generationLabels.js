export const SIZE_LABELS = {
  '1024x1024': 'Square',
  '1024x1536': 'Portrait',
  '1536x1024': 'Landscape',
};

export const QUALITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const FORMAT_LABELS = {
  png: 'PNG',
  jpeg: 'JPEG',
  webp: 'WebP',
};

const FAILURE_LABELS = {
  safety_rejected: 'Blocked by the safety filter',
  invalid_request: 'The provider could not process it',
  rate_limited: 'The provider was busy',
  timeout: 'The provider took too long',
};

export function describeFailure(errorCategory) {
  return FAILURE_LABELS[errorCategory] ?? 'Image generation was unavailable';
}
