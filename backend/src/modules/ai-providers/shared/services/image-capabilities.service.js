import { findEnabledImageModelsRepository } from '#src/modules/image-models/shared/repositories/index.js';

function toCapabilities(imageModel) {
  return {
    provider: imageModel.provider,
    model: imageModel.id,
    label: imageModel.label,
    description: imageModel.description,
    badge: imageModel.badge,
    isDefault: imageModel.isDefault,
    tools: imageModel.tools,
    ...imageModel.capabilities,
    creditsPerImage: imageModel.creditsPerImage,
    providerCostPerImage: imageModel.providerCostPerImage,
  };
}

export function getDefaultImageModelService({ models }) {
  return (models.find(({ isDefault }) => isDefault) ?? models[0])?.model;
}

export async function listImageCapabilitiesService({ fastify, tool }) {
  const imageModels = await findEnabledImageModelsRepository({
    db: fastify.db,
  });

  return imageModels
    .filter((imageModel) => imageModel.tools.includes(tool))
    .map(toCapabilities);
}
