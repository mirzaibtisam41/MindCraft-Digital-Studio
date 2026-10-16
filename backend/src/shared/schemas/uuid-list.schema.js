export const uuidListSchema = {
  type: 'array',
  minItems: 1,
  maxItems: 100,
  uniqueItems: true,
  items: { type: 'string', format: 'uuid' },
};
