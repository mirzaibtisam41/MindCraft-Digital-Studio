import { and, desc, eq } from 'drizzle-orm';
import { imageAnalyses } from '#src/modules/image-analyses/image-analysis.table.js';
import { IMAGE_ANALYSIS_COLUMNS } from '#src/modules/image-analyses/image-analysis-columns.constants.js';

export async function listImageAnalysesRepository({
  db,
  userId,
  imageId,
  status,
  limit,
}) {
  const analyses = await db
    .select(IMAGE_ANALYSIS_COLUMNS)
    .from(imageAnalyses)
    .where(
      and(
        eq(imageAnalyses.userId, userId),
        eq(imageAnalyses.imageId, imageId),
        status ? eq(imageAnalyses.status, status) : undefined,
      ),
    )
    .orderBy(desc(imageAnalyses.createdAt), desc(imageAnalyses.id))
    .limit(limit);

  return analyses.reverse();
}
