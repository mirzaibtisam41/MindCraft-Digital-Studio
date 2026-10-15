import { images } from '#src/modules/images/image.table.js';
import { IMAGE_COLUMNS } from '#src/modules/images/image-columns.constants.js';

export async function createImageRepository({ db, data }) {
  const [image] = await db.insert(images).values(data).returning(IMAGE_COLUMNS);

  return image;
}
