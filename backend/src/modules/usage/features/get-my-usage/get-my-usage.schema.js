export const getMyUsageQuerySchema = {
  type: 'object',
  properties: {
    month: { type: 'string', pattern: '^20[0-9]{2}-(0[1-9]|1[0-2])$' },
    timezone: { type: 'string', minLength: 1, maxLength: 64 },
  },
  additionalProperties: false,
};
