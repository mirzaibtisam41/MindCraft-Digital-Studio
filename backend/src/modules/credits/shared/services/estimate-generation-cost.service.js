import { BadRequestError } from '#src/utils/index.js';

export function estimateGenerationCostService({ capabilities, options }) {
  const creditsPerImage = capabilities.creditsPerImage?.[options.quality];

  if (creditsPerImage === undefined) {
    throw new BadRequestError('Credit cost is not defined for this selection');
  }

  return creditsPerImage * options.n;
}
