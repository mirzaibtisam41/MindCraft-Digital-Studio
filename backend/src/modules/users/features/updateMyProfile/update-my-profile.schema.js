import { nameFieldSchema } from '#src/shared/index.js';

export const updateMyProfileBodySchema = {
  type: 'object',
  required: ['name'],
  properties: { name: nameFieldSchema },
  additionalProperties: false,
};
