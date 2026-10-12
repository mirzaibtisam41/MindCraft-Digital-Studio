import { asc, eq } from 'drizzle-orm';
import { imageModels } from '#src/modules/image-models/image-model.table.js';

export async function findEnabledImageModelsRepository({ db }) {
  return db
    .select()
    .from(imageModels)
    .where(eq(imageModels.enabled, true))
    .orderBy(asc(imageModels.sortOrder), asc(imageModels.id));
}
