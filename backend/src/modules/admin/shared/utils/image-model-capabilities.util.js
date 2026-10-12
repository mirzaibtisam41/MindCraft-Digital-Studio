import { BadRequestError } from '#src/utils/index.js';

export function mergeCapabilitiesUtil({ current, changes }) {
  if (!changes) return current;

  return {
    ...current,
    ...changes,
    defaults: { ...current.defaults, ...changes.defaults },
  };
}

export function assertImageModelConsistentUtil({
  capabilities,
  creditsPerImage,
}) {
  const { defaults } = capabilities;
  const defaultsAreAllowed =
    capabilities.sizes.includes(defaults.size) &&
    capabilities.qualities.includes(defaults.quality) &&
    capabilities.backgrounds.includes(defaults.background) &&
    capabilities.moderations.includes(defaults.moderation) &&
    defaults.n <= capabilities.maxImagesPerRequest;

  if (!defaultsAreAllowed) {
    throw new BadRequestError(
      'Default options must be among the allowed values and within the image limit',
    );
  }

  const missingPrice = capabilities.qualities.find(
    (quality) => creditsPerImage[quality] === undefined,
  );

  if (missingPrice) {
    throw new BadRequestError(`Set a credit price for ${missingPrice} quality`);
  }
}
