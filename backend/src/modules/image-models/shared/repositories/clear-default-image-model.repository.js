import { and, eq, ne } from 'drizzle-orm';
import { imageModels } from '#src/modules/image-models/image-model.table.js';

export async function clearDefaultImageModelRepository({ db, exceptId }) {
  await db
    .update(imageModels)
    .set({ isDefault: false })
    .where(and(eq(imageModels.isDefault, true), ne(imageModels.id, exceptId)));
}
