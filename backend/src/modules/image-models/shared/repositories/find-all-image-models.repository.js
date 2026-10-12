import { asc } from 'drizzle-orm';
import { imageModels } from '#src/modules/image-models/image-model.table.js';

export async function findAllImageModelsRepository({ db }) {
  return db
    .select()
    .from(imageModels)
    .orderBy(asc(imageModels.sortOrder), asc(imageModels.id));
}
