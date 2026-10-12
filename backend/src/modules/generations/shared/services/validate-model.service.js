import { BadRequestError } from '#src/utils/index.js';

export function validateModelService({ model, capabilities }) {
  if (model === undefined || model === null) {
    return capabilities.model;
  }

  if (typeof model !== 'string' || model.trim() !== capabilities.model) {
    throw new BadRequestError('Unsupported image model');
  }

  return capabilities.model;
}
