import { openaiImageProvider } from '#src/modules/ai-providers/providers/index.js';

export async function generateImageService({
  fastify,
  model,
  prompt,
  size,
  quality,
  n,
  background,
  moderation,
}) {
  return openaiImageProvider({
    fastify,
    request: { model, prompt, size, quality, n, background, moderation },
  });
}
