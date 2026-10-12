import { CAPABILITY_STATUS } from '#src/constants/index.js';
import { BadRequestError } from '#src/utils/index.js';
import { GATED_GENERATION_PARAM } from '#src/modules/generations/generation-params.constants.js';

export function validateUnsupportedParamsService({ params, capabilities }) {
  const rejected = Object.entries(GATED_GENERATION_PARAM)
    .filter(([name]) => params[name] !== undefined)
    .filter(
      ([, { feature }]) =>
        capabilities.features[feature] !== CAPABILITY_STATUS.SUPPORTED,
    )
    .map(([, { label }]) => label);

  if (rejected.length > 0) {
    throw new BadRequestError(
      `${rejected.join(', ')} not supported by this model`,
    );
  }
}
