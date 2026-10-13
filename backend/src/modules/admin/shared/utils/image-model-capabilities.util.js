import { CAPABILITY_STATUS } from '#src/constants/index.js';
import { BadRequestError } from '#src/utils/index.js';
import { IMAGE_MODEL_TOOL_FEATURE } from '#src/modules/image-models/image-model.constants.js';

export function mergeCapabilitiesUtil({ current, changes }) {
  if (!changes) return current;

  return {
    ...current,
    ...changes,
    defaults: { ...current.defaults, ...changes.defaults },
  };
}

function assertDefaultsAllowed(capabilities) {
  const { defaults } = capabilities;
  const outputFormats = capabilities.outputFormats ?? [];
  const defaultsAreAllowed =
    capabilities.sizes.includes(defaults.size) &&
    capabilities.qualities.includes(defaults.quality) &&
    capabilities.backgrounds.includes(defaults.background) &&
    capabilities.moderations.includes(defaults.moderation) &&
    outputFormats.includes(defaults.outputFormat) &&
    defaults.n <= capabilities.maxImagesPerRequest;

  if (!defaultsAreAllowed) {
    throw new BadRequestError(
      'Default options must be among the allowed values and within the image limit',
    );
  }
}

function assertPricesSet({ capabilities, creditsPerImage }) {
  const missingPrice = capabilities.qualities.find(
    (quality) => creditsPerImage[quality] === undefined,
  );

  if (missingPrice) {
    throw new BadRequestError(`Set a credit price for ${missingPrice} quality`);
  }
}

function assertToolsSupported({ capabilities, tools }) {
  const unsupportedTool = tools.find(
    (tool) =>
      capabilities.features?.[IMAGE_MODEL_TOOL_FEATURE[tool]] !==
      CAPABILITY_STATUS.SUPPORTED,
  );

  if (unsupportedTool) {
    throw new BadRequestError(
      `This model does not support the ${unsupportedTool} tool`,
    );
  }
}

export function assertImageModelConsistentUtil({
  capabilities,
  creditsPerImage,
  tools,
}) {
  assertDefaultsAllowed(capabilities);
  assertPricesSet({ capabilities, creditsPerImage });
  assertToolsSupported({ capabilities, tools });
}
