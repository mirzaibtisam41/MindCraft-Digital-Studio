import { NotFoundError } from '#src/utils/index.js';
import { MODEL_NOT_FOUND_MESSAGE } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.constants.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { listModelCreditPricesRepository } from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';

export async function listModelCreditPricesService({ db, modelId }) {
  const model = await findAiModelByIdRepository({ db, id: modelId });

  if (!model) {
    throw new NotFoundError(MODEL_NOT_FOUND_MESSAGE);
  }

  return listModelCreditPricesRepository({ db, modelId });
}
