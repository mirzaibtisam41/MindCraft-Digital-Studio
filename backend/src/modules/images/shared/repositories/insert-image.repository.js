import { images } from '#src/modules/images/image.table.js';

export async function insertImageRepository({ db, data }) {
  const [image] = await db.insert(images).values(data).returning();

  return image;
}
