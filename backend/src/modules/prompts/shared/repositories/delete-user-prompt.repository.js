import { and, eq } from 'drizzle-orm';
import { prompts } from '#src/modules/prompts/prompt.table.js';

export async function deleteUserPromptRepository({ db, id, userId }) {
  const [prompt] = await db
    .delete(prompts)
    .where(and(eq(prompts.id, id), eq(prompts.userId, userId)))
    .returning({ id: prompts.id });

  return prompt ?? null;
}
