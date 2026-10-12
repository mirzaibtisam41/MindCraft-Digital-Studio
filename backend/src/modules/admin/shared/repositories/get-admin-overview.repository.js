import { sql } from 'drizzle-orm';

export async function getAdminOverviewRepository({ db }) {
  const { rows } = await db.execute(sql`
    select
      (select count(*)::int from users) as users_count,
      (select count(*)::int from users where suspended_at is not null) as suspended_users_count,
      (select count(*)::int from generations) as generations_count,
      (select count(*)::int from generations where status = 'failed') as failed_generations_count,
      (select count(*)::int from generations where created_at >= now() - interval '24 hours') as generations_last_24h,
      (select coalesce(sum(credit_balance), 0)::int from users) as credits_in_circulation,
      (select count(*)::int from image_models where enabled) as enabled_models_count,
      (select count(*)::int from image_models) as models_count
  `);

  const row = rows[0];

  return {
    usersCount: row.users_count,
    suspendedUsersCount: row.suspended_users_count,
    generationsCount: row.generations_count,
    failedGenerationsCount: row.failed_generations_count,
    generationsLast24h: row.generations_last_24h,
    creditsInCirculation: row.credits_in_circulation,
    enabledModelsCount: row.enabled_models_count,
    modelsCount: row.models_count,
  };
}
