import { eq } from 'drizzle-orm';
import { imageModels } from '#src/modules/image-models/image-model.table.js';

export async function findImageModelByIdRepository({ db, id }) {
  const [imageModel] = await db
    .select()
    .from(imageModels)
    .where(eq(imageModels.id, id))
    .limit(1);

  return imageModel ?? null;
}
