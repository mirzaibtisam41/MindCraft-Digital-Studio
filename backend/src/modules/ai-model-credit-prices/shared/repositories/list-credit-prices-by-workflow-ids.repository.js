import { inArray } from 'drizzle-orm';
import { aiModelCreditPrices } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.table.js';

export function listCreditPricesByWorkflowIdsRepository({
  db,
  modelWorkflowIds,
}) {
  return db
    .select({
      modelWorkflowId: aiModelCreditPrices.modelWorkflowId,
      quality: aiModelCreditPrices.quality,
      creditsPerImage: aiModelCreditPrices.creditsPerImage,
    })
    .from(aiModelCreditPrices)
    .where(inArray(aiModelCreditPrices.modelWorkflowId, modelWorkflowIds));
}
