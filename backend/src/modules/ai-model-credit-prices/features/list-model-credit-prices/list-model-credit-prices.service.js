import { NotFoundError } from '#src/utils/index.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { listModelCreditPricesRepository } from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';

export async function listModelCreditPricesService({ db, modelId }) {
  const model = await findAiModelByIdRepository({ db, id: modelId });

  if (!model) {
    throw new NotFoundError('Model not found');
  }

  return listModelCreditPricesRepository({ db, modelId });
}
