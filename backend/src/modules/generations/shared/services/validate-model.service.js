import { BadRequestError } from '#src/utils/index.js';

export function validateModelService({
  model,
  userDefaultModel,
  defaultModel,
  supportedModels,
}) {
  if (model !== undefined && model !== null) {
    const requestedModel = typeof model === 'string' ? model.trim() : model;

    if (!supportedModels.includes(requestedModel)) {
      throw new BadRequestError(
        `Unsupported image model. Supported: ${supportedModels.join(', ')}`,
      );
    }

    return requestedModel;
  }

  if (supportedModels.includes(userDefaultModel)) {
    return userDefaultModel;
  }

  return defaultModel;
}
