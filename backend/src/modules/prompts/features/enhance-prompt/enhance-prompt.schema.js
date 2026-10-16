import {
  promptStyleSchema,
  promptTextSchema,
} from '#src/modules/prompts/shared/schemas/prompt-fields.schema.js';

export const enhancePromptBodySchema = {
  type: 'object',
  required: ['prompt'],
  properties: {
    prompt: promptTextSchema,
    style: promptStyleSchema,
    anotherAngle: { type: 'boolean' },
  },
  additionalProperties: false,
};
