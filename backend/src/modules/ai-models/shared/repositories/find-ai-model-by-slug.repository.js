import { eq } from 'drizzle-orm';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';

export async function findAiModelBySlugRepository({ db, slug }) {
  const [model] = await db
    .select({ id: aiModels.id })
    .from(aiModels)
    .where(eq(aiModels.slug, slug))
    .limit(1);

  return model ?? null;
}
