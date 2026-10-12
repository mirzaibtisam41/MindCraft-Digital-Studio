import { BadRequestError } from '#src/utils/index.js';
import { GENERATION_STYLE_PRESET_IDS } from '#src/modules/generations/generation-style-preset.constants.js';

function assertSupportedChoice({ value, supportedValues, label }) {
  if (value === undefined) {
    return;
  }

  if (!supportedValues.includes(value)) {
    throw new BadRequestError(
      `Unsupported ${label}. Supported: ${supportedValues.join(', ')}`,
    );
  }
}

export function validateSettingsService({ settings, capabilities }) {
  const { size, quality, n, background, moderation, outputFormat, style } =
    settings;

  assertSupportedChoice({
    value: size,
    supportedValues: capabilities.sizes,
    label: 'image size',
  });

  assertSupportedChoice({
    value: quality,
    supportedValues: capabilities.qualities,
    label: 'image quality',
  });

  assertSupportedChoice({
    value: background,
    supportedValues: capabilities.backgrounds,
    label: 'image background',
  });

  assertSupportedChoice({
    value: moderation,
    supportedValues: capabilities.moderations,
    label: 'moderation level',
  });

  assertSupportedChoice({
    value: style,
    supportedValues: GENERATION_STYLE_PRESET_IDS,
    label: 'style preset',
  });

  assertSupportedChoice({
    value: outputFormat,
    supportedValues: capabilities.outputFormats,
    label: 'output format',
  });

  if (n !== undefined) {
    const isValidCount =
      Number.isInteger(n) && n >= 1 && n <= capabilities.maxImagesPerRequest;

    if (!isValidCount) {
      throw new BadRequestError(
        `Number of images must be between 1 and ${capabilities.maxImagesPerRequest}`,
      );
    }
  }

  return { size, quality, n, background, moderation, outputFormat, style };
}
