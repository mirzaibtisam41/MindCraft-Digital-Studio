import { buildOpenaiImageCapabilities } from '#src/modules/ai-providers/providers/index.js';

export function getImageCapabilitiesService({ fastify }) {
  return buildOpenaiImageCapabilities({ appConfig: fastify.config });
}
