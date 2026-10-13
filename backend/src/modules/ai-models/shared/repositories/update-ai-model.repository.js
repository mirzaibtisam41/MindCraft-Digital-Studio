import { eq } from 'drizzle-orm';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { AI_MODEL_COLUMNS } from '#src/modules/ai-models/ai-model-columns.constants.js';

export async function updateAiModelRepository({ db, id, data }) {
  const [model] = await db
    .update(aiModels)
    .set(data)
    .where(eq(aiModels.id, id))
    .returning(AI_MODEL_COLUMNS);

  return model ?? null;
}
