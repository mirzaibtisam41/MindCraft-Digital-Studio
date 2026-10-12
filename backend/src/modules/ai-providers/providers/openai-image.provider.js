import {
  DEFAULT_IMAGE_OUTPUT_FORMAT,
  IMAGE_MIME_TYPES,
} from '#src/constants/index.js';
import { mapOpenaiErrorUtil } from '#src/modules/ai-providers/shared/utils/index.js';

async function generateImages({ fastify, model, request }) {
  try {
    return await fastify.openai.images.generate({
      model,
      prompt: request.prompt,
      size: request.size,
      quality: request.quality,
      n: request.n,
      output_format: DEFAULT_IMAGE_OUTPUT_FORMAT,
    });
  } catch (error) {
    fastify.log.error(
      {
        status: error.status,
        code: error.code,
        type: error.type,
        requestId: error.requestID,
        message: error.message,
      },
      'OpenAI image request failed',
    );

    throw mapOpenaiErrorUtil({ error });
  }
}

export async function openaiImageProvider({ fastify, request }) {
  const model = fastify.config.OPENAI_IMAGE_MODEL;
  const result = await generateImages({ fastify, model, request });

  return {
    provider: 'openai',
    model,
    images: result.data.map((image) => ({
      data: Buffer.from(image.b64_json, 'base64'),
      mimeType: IMAGE_MIME_TYPES[DEFAULT_IMAGE_OUTPUT_FORMAT],
    })),
  };
}
