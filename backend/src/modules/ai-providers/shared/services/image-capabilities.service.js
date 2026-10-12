import {
  buildOpenaiImageCapabilities,
  listOpenaiImageModels,
} from '#src/modules/ai-providers/providers/index.js';

export function getDefaultImageModelService({ fastify }) {
  return fastify.config.OPENAI_IMAGE_MODEL;
}

export function getImageCapabilitiesService({ fastify, model }) {
  return buildOpenaiImageCapabilities({
    model: model ?? getDefaultImageModelService({ fastify }),
  });
}

export function listImageCapabilitiesService() {
  return listOpenaiImageModels().map((model) =>
    buildOpenaiImageCapabilities({ model }),
  );
}
