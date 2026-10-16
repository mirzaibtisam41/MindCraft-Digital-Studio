import {
  promptCategorySchema,
  promptStyleSchema,
  promptTextSchema,
  promptTitleSchema,
} from '#src/modules/prompts/shared/schemas/prompt-fields.schema.js';

export const updateMyPromptBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    title: promptTitleSchema,
    text: promptTextSchema,
    category: promptCategorySchema,
    style: promptStyleSchema,
  },
  additionalProperties: false,
};
