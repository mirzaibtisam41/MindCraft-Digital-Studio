import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { AI_MODEL_COLUMNS } from '#src/modules/ai-models/ai-model-columns.constants.js';

export async function createAiModelRepository({ db, data }) {
  const [model] = await db
    .insert(aiModels)
    .values(data)
    .returning(AI_MODEL_COLUMNS);

  return model;
}
