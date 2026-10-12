import { imageModels } from '#src/modules/image-models/image-model.table.js';

export async function insertImageModelRepository({ db, data }) {
  const [imageModel] = await db.insert(imageModels).values(data).returning();

  return imageModel;
}
