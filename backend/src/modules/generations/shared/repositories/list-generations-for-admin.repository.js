import { and, desc, eq, sql } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';
import { users } from '#src/modules/users/user.table.js';

const ADMIN_GENERATION_COLUMNS = {
  id: generations.id,
  type: generations.type,
  status: generations.status,
  prompt: generations.prompt,
  provider: generations.provider,
  model: generations.model,
  settings: generations.settings,
  imageCount: generations.imageCount,
  errorCategory: generations.errorCategory,
  errorMessage: generations.errorMessage,
  startedAt: generations.startedAt,
  completedAt: generations.completedAt,
  createdAt: generations.createdAt,
  userId: generations.userId,
  userName: users.name,
  userEmail: users.email,
};

function buildFilters({ status, userId, model }) {
  const filters = [];

  if (status) filters.push(eq(generations.status, status));
  if (userId) filters.push(eq(generations.userId, userId));
  if (model) filters.push(eq(generations.model, model));

  return filters.length > 0 ? and(...filters) : undefined;
}

export async function listGenerationsForAdminRepository({
  db,
  status,
  userId,
  model,
  limit,
  offset,
}) {
  const where = buildFilters({ status, userId, model });

  const items = await db
    .select(ADMIN_GENERATION_COLUMNS)
    .from(generations)
    .innerJoin(users, eq(users.id, generations.userId))
    .where(where)
    .orderBy(desc(generations.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql`count(*)::int` })
    .from(generations)
    .where(where);

  return { items, total };
}

export async function findGenerationForAdminRepository({ db, id }) {
  const [generation] = await db
    .select(ADMIN_GENERATION_COLUMNS)
    .from(generations)
    .innerJoin(users, eq(users.id, generations.userId))
    .where(eq(generations.id, id))
    .limit(1);

  return generation ?? null;
}
