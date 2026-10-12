import { BadRequestError } from '#src/utils/index.js';
import { CREDITS_PER_IMAGE } from '#src/modules/credits/credit.constants.js';

export function estimateGenerationCostService({ model, options }) {
  const creditsPerImage = CREDITS_PER_IMAGE[model]?.[options.quality];

  if (creditsPerImage === undefined) {
    throw new BadRequestError('Credit cost is not defined for this selection');
  }

  return creditsPerImage * options.n;
}
