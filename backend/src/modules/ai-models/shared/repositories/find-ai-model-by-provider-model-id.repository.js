import { and, eq } from 'drizzle-orm';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';

export async function findAiModelByProviderModelIdRepository({
  db,
  providerId,
  providerModelId,
}) {
  const [model] = await db
    .select({ id: aiModels.id })
    .from(aiModels)
    .where(
      and(
        eq(aiModels.providerId, providerId),
        eq(aiModels.providerModelId, providerModelId),
      ),
    )
    .limit(1);

  return model ?? null;
}
