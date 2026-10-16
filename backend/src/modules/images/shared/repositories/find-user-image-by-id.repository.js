import { and, eq } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';
import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { IMAGE_WITH_GENERATION_COLUMNS } from '#src/modules/images/image-columns.constants.js';

export async function findUserImageByIdRepository({ db, id, userId }) {
  const [image] = await db
    .select(IMAGE_WITH_GENERATION_COLUMNS)
    .from(images)
    .leftJoin(generations, eq(generations.id, images.generationId))
    .leftJoin(aiModels, eq(aiModels.id, generations.modelId))
    .where(and(eq(images.id, id), eq(images.userId, userId)))
    .limit(1);

  return image ?? null;
}
