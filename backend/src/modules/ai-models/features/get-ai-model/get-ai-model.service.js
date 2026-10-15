import { NotFoundError } from '#src/utils/index.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function getAiModelService({ db, id }) {
  const model = await findAiModelByIdRepository({ db, id });

  if (!model) {
    throw new NotFoundError('Model not found');
  }

  return model;
}
