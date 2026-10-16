import { asc, inArray } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';
import { IMAGE_COLUMNS } from '#src/modules/images/image-columns.constants.js';

export function listGenerationImagesRepository({ db, generationIds }) {
  return db
    .select(IMAGE_COLUMNS)
    .from(images)
    .where(inArray(images.generationId, generationIds))
    .orderBy(asc(images.createdAt), asc(images.id));
}
