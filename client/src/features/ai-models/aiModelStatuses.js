export const AI_MODEL_STATUSES = [
  { value: 'draft', label: 'Draft', tone: 'neutral' },
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'disabled', label: 'Disabled', tone: 'warning' },
  { value: 'deprecated', label: 'Deprecated', tone: 'danger' },
];

export function findAiModelStatus(value) {
  return AI_MODEL_STATUSES.find((status) => status.value === value);
}
