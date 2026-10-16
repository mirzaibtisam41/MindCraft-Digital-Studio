import { and, eq } from 'drizzle-orm';
import { aiModelCreditPrices } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.table.js';

export async function findWorkflowCreditPriceRepository({
  db,
  modelWorkflowId,
  quality,
}) {
  const [price] = await db
    .select({ creditsPerImage: aiModelCreditPrices.creditsPerImage })
    .from(aiModelCreditPrices)
    .where(
      and(
        eq(aiModelCreditPrices.modelWorkflowId, modelWorkflowId),
        eq(aiModelCreditPrices.quality, quality),
      ),
    )
    .limit(1);

  return price ?? null;
}
