import { and, count, desc, eq } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';
import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { projectImages } from '#src/modules/projects/project-image.table.js';
import { IMAGE_WITH_GENERATION_COLUMNS } from '#src/modules/images/image-columns.constants.js';

export async function listProjectImagesRepository({
  db,
  projectId,
  collectionId,
  limit,
  offset,
}) {
  const where = and(
    eq(projectImages.projectId, projectId),
    collectionId ? eq(projectImages.collectionId, collectionId) : undefined,
  );

  const imageList = await db
    .select({
      ...IMAGE_WITH_GENERATION_COLUMNS,
      collectionId: projectImages.collectionId,
      addedAt: projectImages.addedAt,
    })
    .from(projectImages)
    .innerJoin(images, eq(images.id, projectImages.imageId))
    .leftJoin(generations, eq(generations.id, images.generationId))
    .leftJoin(aiModels, eq(aiModels.id, generations.modelId))
    .where(where)
    .orderBy(desc(projectImages.addedAt), desc(images.id))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(projectImages)
    .where(where);

  return { images: imageList, total };
}
