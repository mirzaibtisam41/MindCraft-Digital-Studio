import { CREDITS_PER_IMAGE } from '#src/modules/credits/credit.constants.js';
import { GENERATION_STYLE_PRESETS } from '#src/modules/generations/generation-style-preset.constants.js';
import { listSupportedAspectRatiosUtil } from '#src/modules/generations/shared/utils/index.js';

function presentModel(capabilities) {
  return {
    id: capabilities.model,
    label: capabilities.label,
    provider: capabilities.provider,
    sizes: capabilities.sizes,
    aspectRatios: listSupportedAspectRatiosUtil(capabilities.sizes),
    qualities: capabilities.qualities,
    backgrounds: capabilities.backgrounds,
    moderations: capabilities.moderations,
    outputFormats: capabilities.outputFormats,
    maxImagesPerRequest: capabilities.maxImagesPerRequest,
    maxPromptLength: capabilities.maxPromptLength,
    creditsPerImage: CREDITS_PER_IMAGE[capabilities.model],
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
