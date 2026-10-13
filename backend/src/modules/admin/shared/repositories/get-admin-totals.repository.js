import { sql } from 'drizzle-orm';

export async function getAdminTotalsRepository({ db }) {
  const { rows } = await db.execute(sql`
    select
      (select count(*)::int from users) as users_count,
      (select count(*)::int from users where suspended_at is not null) as suspended_users_count,
      (select count(*)::int from generations) as generations_count,
      (select count(*)::int from images) as images_count,
      (select coalesce(sum(credit_balance), 0)::int from users) as credits_in_circulation,
      (select count(*)::int from image_models where enabled) as enabled_models_count,
      (select count(*)::int from image_models) as models_count
  `);

  const row = rows[0];

  return {
    usersCount: row.users_count,
    suspendedUsersCount: row.suspended_users_count,
    generationsCount: row.generations_count,
    imagesCount: row.images_count,
    creditsInCirculation: row.credits_in_circulation,
    enabledModelsCount: row.enabled_models_count,
    modelsCount: row.models_count,
  };
}
