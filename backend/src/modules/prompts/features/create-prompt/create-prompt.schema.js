import {
  promptCategorySchema,
  promptStyleSchema,
  promptTextSchema,
  promptTitleSchema,
} from '#src/modules/prompts/shared/schemas/prompt-fields.schema.js';

export const createPromptBodySchema = {
  type: 'object',
  required: ['title', 'text', 'category'],
  properties: {
    title: promptTitleSchema,
    text: promptTextSchema,
    category: promptCategorySchema,
    style: promptStyleSchema,
  },
  additionalProperties: false,
};
