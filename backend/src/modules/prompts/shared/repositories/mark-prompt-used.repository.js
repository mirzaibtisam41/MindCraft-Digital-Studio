import { and, eq, sql } from 'drizzle-orm';
import { prompts } from '#src/modules/prompts/prompt.table.js';
import { PROMPT_COLUMNS } from '#src/modules/prompts/prompt-columns.constants.js';

export async function markPromptUsedRepository({ db, id, userId }) {
  const [prompt] = await db
    .update(prompts)
    .set({
      usageCount: sql`${prompts.usageCount} + 1`,
      lastUsedAt: new Date(),
      updatedAt: sql`${prompts.updatedAt}`,
    })
    .where(and(eq(prompts.id, id), eq(prompts.userId, userId)))
    .returning(PROMPT_COLUMNS);

  return prompt ?? null;
}
