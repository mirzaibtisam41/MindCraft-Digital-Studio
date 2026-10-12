import { StringOutputParser } from '@langchain/core/output_parsers';
import { enhanceImagePromptPrompt } from '#src/modules/ai-providers/prompts/index.js';
import { mapOpenaiErrorUtil } from '#src/modules/ai-providers/shared/utils/index.js';

export async function enhancePromptService({ fastify, prompt }) {
  const chain = enhanceImagePromptPrompt
    .pipe(fastify.chatModel)
    .pipe(new StringOutputParser());

  try {
    return await chain.invoke({ prompt });
  } catch (error) {
    fastify.log.error(
      { status: error.status, code: error.code, message: error.message },
      'Prompt enhancement failed',
    );

    throw mapOpenaiErrorUtil({ error });
  }
}
