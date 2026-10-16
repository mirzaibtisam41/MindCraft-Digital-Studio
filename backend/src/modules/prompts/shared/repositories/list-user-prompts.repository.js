import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { escapeLikePatternUtil } from '#src/utils/index.js';
import { prompts } from '#src/modules/prompts/prompt.table.js';
import { PROMPT_COLUMNS } from '#src/modules/prompts/prompt-columns.constants.js';

export async function listUserPromptsRepository({
  db,
  userId,
  category,
  search,
  limit,
}) {
  const searchCondition = search
    ? or(
        ilike(prompts.title, `%${escapeLikePatternUtil({ text: search })}%`),
        ilike(prompts.text, `%${escapeLikePatternUtil({ text: search })}%`),
      )
    : undefined;

  const promptList = await db
    .select(PROMPT_COLUMNS)
    .from(prompts)
    .where(
      and(
        eq(prompts.userId, userId),
        category ? eq(prompts.category, category) : undefined,
        searchCondition,
      ),
    )
    .orderBy(desc(prompts.updatedAt), desc(prompts.id))
    .limit(limit);

  const categoryRows = await db
    .select({ category: prompts.category, total: count() })
    .from(prompts)
    .where(and(eq(prompts.userId, userId), searchCondition))
    .groupBy(prompts.category);

  return { prompts: promptList, categoryRows };
}
