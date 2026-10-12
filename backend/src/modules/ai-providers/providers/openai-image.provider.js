import {
  DEFAULT_IMAGE_OUTPUT_FORMAT,
  IMAGE_MIME_TYPES,
} from '#src/constants/index.js';

export async function openaiImageProvider({ fastify, request }) {
  const model = fastify.config.OPENAI_IMAGE_MODEL;

  const result = await fastify.openai.images.generate({
    model,
    prompt: request.prompt,
    size: request.size,
    quality: request.quality,
    n: request.n,
    output_format: DEFAULT_IMAGE_OUTPUT_FORMAT,
  });

  return {
    provider: 'openai',
    model,
    images: result.data.map((image) => ({
      data: Buffer.from(image.b64_json, 'base64'),
      mimeType: IMAGE_MIME_TYPES[DEFAULT_IMAGE_OUTPUT_FORMAT],
    })),
  };
}
