import {
  BadRequestError,
  ConflictError,
  isUniqueViolationErrorUtil,
} from '#src/utils/index.js';
import {
  AI_MODEL_PROVIDER_MODEL_TAKEN_MESSAGE,
  AI_MODEL_PROVIDER_NOT_FOUND_MESSAGE,
  AI_MODEL_SLUG_TAKEN_MESSAGE,
} from '#src/modules/ai-models/ai-model.constants.js';
import { findAiProviderByIdRepository } from '#src/modules/ai-providers/shared/repositories/index.js';
import {
  createAiModelRepository,
  findAiModelByProviderModelIdRepository,
  findAiModelBySlugRepository,
} from '#src/modules/ai-models/shared/repositories/index.js';

const SLUG_UNIQUE_CONSTRAINT = 'ai_models_slug_unique';

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
    throw new BadRequestError(AI_MODEL_PROVIDER_NOT_FOUND_MESSAGE);
  }

  const modelWithSameSlug = await findAiModelBySlugRepository({
    db,
    slug: newModel.slug,
  });

  if (modelWithSameSlug) {
    throw new ConflictError(AI_MODEL_SLUG_TAKEN_MESSAGE);
  }

  const modelWithSameProviderModelId =
    await findAiModelByProviderModelIdRepository({
      db,
      providerId: newModel.providerId,
      providerModelId: newModel.providerModelId,
    });

  if (modelWithSameProviderModelId) {
    throw new ConflictError(AI_MODEL_PROVIDER_MODEL_TAKEN_MESSAGE);
  }

  try {
    return await createAiModelRepository({ db, data: newModel });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      const constraint = error.cause?.constraint ?? error.constraint;

      throw new ConflictError(
        constraint === SLUG_UNIQUE_CONSTRAINT
          ? AI_MODEL_SLUG_TAKEN_MESSAGE
          : AI_MODEL_PROVIDER_MODEL_TAKEN_MESSAGE,
      );
    }

    throw error;
  }
}
