import {
  PROMPT_CATEGORIES,
  PROMPT_STYLES,
} from '#src/modules/prompts/prompt.constants.js';
import { PROMPT_TEMPLATES } from '#src/modules/prompts/prompt-templates.constants.js';

export async function getPromptOptionsController(_request, reply) {
  return reply.success({
    data: {
      styles: PROMPT_STYLES,
      categories: PROMPT_CATEGORIES,
      templates: PROMPT_TEMPLATES,
    },
  });
}
