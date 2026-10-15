import { and, eq, notInArray } from 'drizzle-orm';
import { aiModelCreditPrices } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.table.js';

export async function deleteWorkflowCreditPricesExceptRepository({
  db,
  modelWorkflowId,
  qualitiesToKeep,
}) {
  const conditions = [eq(aiModelCreditPrices.modelWorkflowId, modelWorkflowId)];

  if (qualitiesToKeep.length > 0) {
    conditions.push(notInArray(aiModelCreditPrices.quality, qualitiesToKeep));
  }

  await db.delete(aiModelCreditPrices).where(and(...conditions));
}
