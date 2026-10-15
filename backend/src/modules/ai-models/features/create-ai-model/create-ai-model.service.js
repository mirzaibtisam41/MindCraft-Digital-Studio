import {
  BadRequestError,
  ConflictError,
  isUniqueViolationErrorUtil,
} from '#src/utils/index.js';
import { findAiProviderByIdRepository } from '#src/modules/ai-providers/shared/repositories/index.js';
import { createAiModelRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function createAiModelService({ db, data, adminId }) {
  const newModel = {
    providerId: data.providerId,
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    providerModelId: data.providerModelId.trim(),
    description: data.description?.trim() || null,
    sortOrder: data.sortOrder,
    createdBy: adminId,
  };

  const provider = await findAiProviderByIdRepository({
    db,
    id: newModel.providerId,
  });

  if (!provider) {
    throw new BadRequestError('The selected provider does not exist');
  }

  try {
    return await createAiModelRepository({ db, data: newModel });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      const constraint = error.cause?.constraint ?? error.constraint;

      throw new ConflictError(
        constraint === 'ai_models_slug_unique'
          ? 'A model with this slug already exists'
          : 'This provider already has a model with this provider model ID',
      );
    }

    throw error;
  }
}
