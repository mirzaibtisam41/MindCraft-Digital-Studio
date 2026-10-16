import { and, eq } from 'drizzle-orm';
import { prompts } from '#src/modules/prompts/prompt.table.js';
import { PROMPT_COLUMNS } from '#src/modules/prompts/prompt-columns.constants.js';

export async function updateUserPromptRepository({ db, id, userId, data }) {
  const [prompt] = await db
    .update(prompts)
    .set(data)
    .where(and(eq(prompts.id, id), eq(prompts.userId, userId)))
    .returning(PROMPT_COLUMNS);

  return prompt ?? null;
}
