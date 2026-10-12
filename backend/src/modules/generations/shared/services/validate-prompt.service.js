import { BadRequestError } from '#src/utils/index.js';
import { GENERATION_PROMPT_MAX_LENGTH } from '#src/modules/generations/generation.constants.js';
import { normalizePromptUtil } from '#src/modules/generations/shared/utils/index.js';

export function validatePromptService({ prompt, capabilities }) {
  if (typeof prompt !== 'string') {
    throw new BadRequestError('Prompt is required');
  }

  const normalizedPrompt = normalizePromptUtil(prompt);

  if (normalizedPrompt.length === 0) {
    throw new BadRequestError('Prompt cannot be empty');
  }

  const maxLength = Math.min(
    GENERATION_PROMPT_MAX_LENGTH,
    capabilities.maxPromptLength,
  );

  if (normalizedPrompt.length > maxLength) {
    throw new BadRequestError(`Prompt cannot exceed ${maxLength} characters`);
  }

  return normalizedPrompt;
}
