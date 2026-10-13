import { sql } from 'drizzle-orm';

export async function getAdminPeriodStatsRepository({ db, from, to }) {
  const { rows } = await db.execute(sql`
    select
      (select count(*)::int from users
        where created_at >= ${from} and created_at < ${to}) as new_users,
      (select count(distinct user_id)::int from generations
        where created_at >= ${from} and created_at < ${to}) as active_users,
      (select count(*)::int from generations
        where created_at >= ${from} and created_at < ${to}) as generations,
      (select count(*)::int from generations
        where status = 'completed' and created_at >= ${from} and created_at < ${to}) as completed,
      (select count(*)::int from generations
        where status = 'failed' and created_at >= ${from} and created_at < ${to}) as failed,
      (select round(avg(extract(epoch from (completed_at - started_at)) * 1000))::int
        from generations
        where status = 'completed' and started_at is not null and completed_at is not null
          and created_at >= ${from} and created_at < ${to}) as avg_duration_ms,
      (select coalesce(sum(provider_cost_usd), 0)::float8 from generations
        where created_at >= ${from} and created_at < ${to}) as provider_cost_usd,
      (select count(*)::int from images
        where created_at >= ${from} and created_at < ${to}) as images,
      (select coalesce(-sum(amount), 0)::int from credit_transactions
        where type in ('generation_hold', 'generation_refund')
          and created_at >= ${from} and created_at < ${to}) as credits_spent,
      (select coalesce(sum(amount), 0)::int from credit_transactions
        where (type = 'signup_grant' or (type = 'admin_adjustment' and amount > 0))
          and created_at >= ${from} and created_at < ${to}) as credits_issued
  `);

  const row = rows[0];

  return {
    newUsers: row.new_users,
    activeUsers: row.active_users,
    generations: row.generations,
    completed: row.completed,
    failed: row.failed,
    avgDurationMs: row.avg_duration_ms,
    providerCostUsd: row.provider_cost_usd,
    images: row.images,
    creditsSpent: row.credits_spent,
    creditsIssued: row.credits_issued,
  };
}
