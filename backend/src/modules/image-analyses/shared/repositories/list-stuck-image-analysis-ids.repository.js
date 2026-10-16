import { and, asc, eq, lt } from 'drizzle-orm';
import { imageAnalyses } from '#src/modules/image-analyses/image-analysis.table.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export async function listStuckImageAnalysisIdsRepository({
  db,
  startedBefore,
}) {
  const rows = await db
    .select({ id: imageAnalyses.id })
    .from(imageAnalyses)
    .where(
      and(
        eq(imageAnalyses.status, GENERATION_STATUS.PROCESSING),
        lt(imageAnalyses.createdAt, startedBefore),
      ),
    )
    .orderBy(asc(imageAnalyses.createdAt))
    .limit(100);

  return rows.map((row) => row.id);
}
