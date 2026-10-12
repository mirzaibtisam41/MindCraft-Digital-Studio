import { BadRequestError } from '#src/utils/index.js';

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
  const { size, quality, n, background, outputFormat } = settings;

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

  return { size, quality, n, background, outputFormat };
}
