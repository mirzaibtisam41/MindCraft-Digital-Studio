import { openaiImageProvider } from '#src/modules/ai-providers/providers/index.js';

export async function generateImageService({
  fastify,
  prompt,
  size,
  quality,
  n,
}) {
  return openaiImageProvider({
    fastify,
    request: { prompt, size, quality, n },
  });
}
