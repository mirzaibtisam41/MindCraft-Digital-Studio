import { promptCategorySchema } from '#src/modules/prompts/shared/schemas/prompt-fields.schema.js';

export const listMyPromptsQuerySchema = {
  type: 'object',
  properties: {
    category: promptCategorySchema,
    search: { type: 'string', maxLength: 200 },
  },
  additionalProperties: false,
};
