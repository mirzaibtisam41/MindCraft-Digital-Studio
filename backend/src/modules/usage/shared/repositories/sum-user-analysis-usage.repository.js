import { and, eq, sql } from 'drizzle-orm';
import { imageAnalyses } from '#src/modules/image-analyses/image-analysis.table.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import {
  isInLocalRangeSqlUtil,
  localDaySqlUtil,
} from '#src/modules/usage/shared/utils/index.js';

export function sumUserAnalysisUsageRepository({ db, userId, range }) {
  return db
    .select({
      day: localDaySqlUtil({
        column: imageAnalyses.createdAt,
        timezone: range.timezone,
      }),
      credits: sql`coalesce(sum(${imageAnalyses.credits}), 0)::int`,
      runs: sql`count(*)::int`,
    })
    .from(imageAnalyses)
    .where(
      and(
        eq(imageAnalyses.userId, userId),
        eq(imageAnalyses.status, GENERATION_STATUS.SUCCEEDED),
        isInLocalRangeSqlUtil({ column: imageAnalyses.createdAt, range }),
      ),
    )
    .groupBy(sql`1`);
}
