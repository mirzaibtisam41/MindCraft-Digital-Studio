import { sql } from 'drizzle-orm';
import { NotFoundError } from '#src/utils/index.js';
import { users } from '#src/modules/users/user.table.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';

export async function completeMyOnboardingController(request, reply) {
  const user = await updateUserRepository({
    db: request.server.db,
    id: request.user.id,
    data: {
      onboardingCompletedAt: sql`coalesce(${users.onboardingCompletedAt}, now())`,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return reply.success({ data: { user } });
}
