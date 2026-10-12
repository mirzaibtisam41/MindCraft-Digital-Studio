import { BadRequestError } from '#src/utils/index.js';
import {
  findNearestSizeByAspectRatioUtil,
  findSizeByAspectRatioUtil,
  listSupportedAspectRatiosUtil,
} from '#src/modules/generations/shared/utils/index.js';

function resolveSize({ settings, userSettings, capabilities }) {
  const { size, aspectRatio } = settings;

  if (aspectRatio !== undefined) {
    const sizeFromRatio = findSizeByAspectRatioUtil({
      aspectRatio,
      sizes: capabilities.sizes,
    });

    if (!sizeFromRatio) {
      const supported = listSupportedAspectRatiosUtil(capabilities.sizes);
      throw new BadRequestError(
        `Unsupported aspect ratio. Supported: ${supported.join(', ')}`,
      );
    }

    if (size !== undefined && size !== sizeFromRatio) {
      throw new BadRequestError('Size and aspect ratio do not match');
    }

    return sizeFromRatio;
  }

  if (size !== undefined) {
    return size;
  }

  if (userSettings?.defaultAspectRatio) {
    return findNearestSizeByAspectRatioUtil({
      aspectRatio: userSettings.defaultAspectRatio,
      sizes: capabilities.sizes,
    });
  }

  return capabilities.defaults.size;
}

export function normalizeOptionsService({
  settings,
  userSettings,
  capabilities,
}) {
  const { defaults } = capabilities;

  return {
    size: resolveSize({ settings, userSettings, capabilities }),
    quality: settings.quality ?? defaults.quality,
    n: settings.n ?? defaults.n,
    background: settings.background ?? defaults.background,
    outputFormat: settings.outputFormat ?? defaults.outputFormat,
  };
}
