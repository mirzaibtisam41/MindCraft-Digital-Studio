import { GENERATION_TYPE_CODES } from '#src/modules/generations/generation.constants.js';

export const getGenerationOptionsQuerySchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: GENERATION_TYPE_CODES },
  },
  additionalProperties: false,
};
