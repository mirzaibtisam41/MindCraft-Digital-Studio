import { NotFoundError } from '#src/utils/index.js';
import { AI_MODEL_NOT_FOUND_MESSAGE } from '#src/modules/ai-models/ai-model.constants.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { listModelCreditPricesRepository } from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';

export async function listModelCreditPricesService({ db, modelId }) {
  const model = await findAiModelByIdRepository({ db, id: modelId });

  if (!model) {
    throw new NotFoundError(AI_MODEL_NOT_FOUND_MESSAGE);
  }

  return listModelCreditPricesRepository({ db, modelId });
}
