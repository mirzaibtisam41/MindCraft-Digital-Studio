import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ProviderError } from '#src/utils/index.js';
import { mapLangChainErrorIntegration } from '#src/integrations/langchain/map-langchain-error.integration.js';

const ENHANCED_PROMPT_SCHEMA = {
  type: 'object',
  properties: {
    enhancedPrompt: { type: 'string' },
    addedDescriptors: { type: 'array', items: { type: 'string' } },
  },
  required: ['enhancedPrompt', 'addedDescriptors'],
  additionalProperties: false,
};

const ENHANCER_SYSTEM_PROMPT = [
  'You improve prompts for an AI image generator.',
  'Keep the subject, the idea and every detail the user wrote. Never change or remove them and never add a new main subject.',
  'Only add what is missing: setting, lighting, composition, camera or medium, color and mood.',
  'If a style is given, make the prompt fit that style.',
  'Write one prompt of at most 900 characters, in the same language as the user.',
  'In addedDescriptors list every phrase you added, copied exactly as it appears in the enhanced prompt.',
].join(' ');

export async function enhancePromptIntegration({ chatModel, prompt, style }) {
  const structuredModel = chatModel.withStructuredOutput(
    ENHANCED_PROMPT_SCHEMA,
    { name: 'enhanced_prompt', method: 'jsonSchema', strict: true },
  );

  try {
    return await structuredModel.invoke([
      new SystemMessage(ENHANCER_SYSTEM_PROMPT),
      new HumanMessage(`Prompt: ${prompt}\nStyle: ${style ?? 'none'}`),
    ]);
  } catch (error) {
    throw new ProviderError({
      category: mapLangChainErrorIntegration({ error }),
      cause: error,
    });
  }
}
