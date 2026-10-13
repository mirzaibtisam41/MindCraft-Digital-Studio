import { GENERATION_STYLE_PRESETS } from '#src/modules/generations/generation-style-preset.constants.js';
import { listSupportedAspectRatiosUtil } from '#src/modules/generations/shared/utils/index.js';

function presentModel(capabilities) {
  return {
    id: capabilities.model,
    label: capabilities.label,
    description: capabilities.description,
    badge: capabilities.badge,
    isDefault: capabilities.isDefault,
    provider: capabilities.provider,
    sizes: capabilities.sizes,
    aspectRatios: listSupportedAspectRatiosUtil(capabilities.sizes),
    qualities: capabilities.qualities,
    backgrounds: capabilities.backgrounds,
    moderations: capabilities.moderations,
    outputFormats: capabilities.outputFormats,
    maxImagesPerRequest: capabilities.maxImagesPerRequest,
    maxPromptLength: capabilities.maxPromptLength,
    creditsPerImage: capabilities.creditsPerImage,
    defaults: capabilities.defaults,
    features: capabilities.features,
  };
}

export function presentImageOptionsService({ defaultModel, models }) {
  return {
    defaultModel,
    models: models.map(presentModel),
    styles: GENERATION_STYLE_PRESETS.map(({ id, label }) => ({ id, label })),
  };
}
