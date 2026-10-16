import { and, eq } from 'drizzle-orm';
import { imageAnalyses } from '#src/modules/image-analyses/image-analysis.table.js';
import { IMAGE_ANALYSIS_COLUMNS } from '#src/modules/image-analyses/image-analysis-columns.constants.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export async function finishProcessingImageAnalysisRepository({
  db,
  id,
  data,
}) {
  const [analysis] = await db
    .update(imageAnalyses)
    .set({ ...data, completedAt: new Date() })
    .where(
      and(
        eq(imageAnalyses.id, id),
        eq(imageAnalyses.status, GENERATION_STATUS.PROCESSING),
      ),
    )
    .returning(IMAGE_ANALYSIS_COLUMNS);

  return analysis ?? null;
}
