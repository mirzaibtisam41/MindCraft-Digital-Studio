import {
  DEFAULT_IMAGE_OUTPUT_FORMAT,
  IMAGE_ERROR_MESSAGE,
  IMAGE_MIME_TYPES,
} from '#src/constants/index.js';
import { ServiceUnavailableError } from '#src/utils/index.js';
import { mapOpenaiErrorUtil } from '#src/modules/ai-providers/shared/utils/index.js';

async function generateImages({ fastify, model, request }) {
  try {
    return await fastify.openai.images.generate({
      model,
      prompt: request.prompt,
      size: request.size,
      quality: request.quality,
      n: request.n,
      background: request.background,
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

async function readImageBinary({ fastify, image }) {
  if (image.b64_json) {
    return Buffer.from(image.b64_json, 'base64');
  }

  if (image.url) {
    const response = await fetch(image.url);

    if (!response.ok) {
      fastify.log.error(
        { status: response.status },
        'Provider image download failed',
      );
      throw new ServiceUnavailableError(IMAGE_ERROR_MESSAGE.UNAVAILABLE);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  throw new ServiceUnavailableError(IMAGE_ERROR_MESSAGE.UNAVAILABLE);
}

export async function openaiImageProvider({ fastify, request }) {
  const model = fastify.config.OPENAI_IMAGE_MODEL;
  const result = await generateImages({ fastify, model, request });

  const images = await Promise.all(
    result.data.map(async (image) => ({
      data: await readImageBinary({ fastify, image }),
      mimeType: IMAGE_MIME_TYPES[DEFAULT_IMAGE_OUTPUT_FORMAT],
    })),
  );

  return { provider: 'openai', model, images };
}
