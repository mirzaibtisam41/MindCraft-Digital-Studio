import { BadRequestError, ServiceUnavailableError } from '#src/utils/index.js';

export function validateModelService({
  model,
  userDefaultModel,
  defaultModel,
  supportedModels,
}) {
  if (supportedModels.length === 0) {
    throw new ServiceUnavailableError('No image models are available');
  }

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

  if (supportedModels.includes(defaultModel)) {
    return defaultModel;
  }

  return supportedModels[0];
}
