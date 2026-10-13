import { sql } from 'drizzle-orm';

export async function getAdminModelUsageRepository({ db, from, to }) {
  const { rows } = await db.execute(sql`
    with model_generations as (
      select model,
        count(*)::int as generations,
        count(*) filter (where status = 'failed')::int as failed,
        coalesce(sum(image_count) filter (where status = 'completed'), 0)::int as images,
        coalesce(sum(provider_cost_usd), 0)::float8 as cost_usd
      from generations
      where created_at >= ${from} and created_at < ${to}
      group by model
    ),
    model_credits as (
      select generations.model,
        coalesce(-sum(credit_transactions.amount), 0)::int as credits_spent
      from credit_transactions
      join generations on generations.id = credit_transactions.generation_id
      where credit_transactions.type in ('generation_hold', 'generation_refund')
        and credit_transactions.created_at >= ${from}
        and credit_transactions.created_at < ${to}
      group by generations.model
    )
    select
      model_generations.model,
      coalesce(image_models.label, model_generations.model) as label,
      model_generations.generations,
      model_generations.failed,
      model_generations.images,
      model_generations.cost_usd as "providerCostUsd",
      coalesce(model_credits.credits_spent, 0) as "creditsSpent"
    from model_generations
    left join model_credits using (model)
    left join image_models on image_models.id = model_generations.model
    order by model_generations.generations desc
  `);

  return rows;
}
