import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';
import {
  findAiModelByIdRepository,
  updateAiModelRepository,
} from '#src/modules/ai-models/shared/repositories/index.js';
import { listEnabledModelWorkflowsRepository } from '#src/modules/model-workflows/shared/repositories/index.js';
import { listModelCreditPricesRepository } from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';

async function checkModelCanBeActivated({ db, modelId }) {
  const workflows = await listEnabledModelWorkflowsRepository({ db, modelId });

  if (workflows.length === 0) {
    throw new BadRequestError(
      'Turn on at least one workflow before activating this model',
    );
  }

  const prices = await listModelCreditPricesRepository({ db, modelId });
  const missingPrices = [];

  for (const workflow of workflows) {
    for (const quality of workflow.enabledOptions.qualities) {
      const hasPrice = prices.some(
        (price) =>
          price.modelWorkflowId === workflow.id && price.quality === quality,
      );

      if (!hasPrice) missingPrices.push(`${workflow.name} (${quality})`);
    }
  }

  if (missingPrices.length > 0) {
    throw new BadRequestError(
      `Set a price for every enabled quality before activating this model: ${missingPrices.join(', ')}`,
    );
  }
}

export async function updateAiModelStatusService({ db, id, status, adminId }) {
  const existingModel = await findAiModelByIdRepository({ db, id });

  if (!existingModel) {
    throw new NotFoundError('Model not found');
  }

  if (status === AI_MODEL_STATUS.ACTIVE) {
    await checkModelCanBeActivated({ db, modelId: id });
  }

  return updateAiModelRepository({
    db,
    id,
    data: { status, updatedBy: adminId },
  });
}
