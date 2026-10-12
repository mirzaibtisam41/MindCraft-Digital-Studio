import { findEnabledImageModelsRepository } from '#src/modules/image-models/shared/repositories/index.js';

function toCapabilities(imageModel) {
  return {
    provider: imageModel.provider,
    model: imageModel.id,
    label: imageModel.label,
    ...imageModel.capabilities,
    creditsPerImage: imageModel.creditsPerImage,
  };
}

export function getDefaultImageModelService({ fastify }) {
  return fastify.config.OPENAI_IMAGE_MODEL;
}

export async function listImageCapabilitiesService({ fastify }) {
  const imageModels = await findEnabledImageModelsRepository({
    db: fastify.db,
  });

  return imageModels.map(toCapabilities);
}
