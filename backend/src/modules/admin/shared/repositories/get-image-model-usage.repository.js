import { sql } from 'drizzle-orm';

export async function getImageModelUsageRepository({ db, modelId, since }) {
  const { rows } = await db.execute(sql`
    select
      count(*)::int as generations,
      count(*) filter (where created_at >= ${since})::int as recent_generations,
      count(*) filter (where status = 'failed')::int as failed,
      coalesce(sum(image_count) filter (where status = 'completed'), 0)::int as images,
      count(distinct user_id)::int as users,
      max(created_at) as last_used_at,
      (select coalesce(-sum(credit_transactions.amount), 0)::int
        from credit_transactions
        join generations as charged on charged.id = credit_transactions.generation_id
        where charged.model = ${modelId}
          and credit_transactions.type in ('generation_hold', 'generation_refund')
      ) as credits_spent
    from generations
    where model = ${modelId}
  `);

  const row = rows[0];

  return {
    generations: row.generations,
    recentGenerations: row.recent_generations,
    failed: row.failed,
    images: row.images,
    users: row.users,
    creditsSpent: row.credits_spent,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
  };
}
