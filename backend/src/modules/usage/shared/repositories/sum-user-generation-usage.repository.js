import { and, eq, sql } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';
import {
  isInLocalRangeSqlUtil,
  localDaySqlUtil,
} from '#src/modules/usage/shared/utils/index.js';

export function sumUserGenerationUsageRepository({ db, userId, range }) {
  return db
    .select({
      day: localDaySqlUtil({
        column: generations.createdAt,
        timezone: range.timezone,
      }),
      typeCode: generationTypes.code,
      credits: sql`coalesce(sum(${generations.totalCredits}), 0)::int`,
      images: sql`coalesce(sum((${generations.options}->>'n')::int), 0)::int`,
      runs: sql`count(*)::int`,
    })
    .from(generations)
    .innerJoin(
      modelWorkflows,
      eq(modelWorkflows.id, generations.modelWorkflowId),
    )
    .innerJoin(
      generationTypes,
      eq(generationTypes.id, modelWorkflows.generationTypeId),
    )
    .where(
      and(
        eq(generations.userId, userId),
        eq(generations.status, GENERATION_STATUS.SUCCEEDED),
        isInLocalRangeSqlUtil({ column: generations.createdAt, range }),
      ),
    )
    .groupBy(sql`1`, sql`2`);
}
