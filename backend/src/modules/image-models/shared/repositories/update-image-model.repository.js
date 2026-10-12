import { eq } from 'drizzle-orm';
import { imageModels } from '#src/modules/image-models/image-model.table.js';

export async function updateImageModelRepository({ db, id, data }) {
  const [imageModel] = await db
    .update(imageModels)
    .set(data)
    .where(eq(imageModels.id, id))
    .returning();

  return imageModel ?? null;
}
