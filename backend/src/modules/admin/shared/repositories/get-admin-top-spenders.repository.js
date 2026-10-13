import { sql } from 'drizzle-orm';

export async function getAdminTopSpendersRepository({ db, from, to, limit }) {
  const { rows } = await db.execute(sql`
    select
      users.id as "userId",
      users.name,
      users.email,
      (-sum(credit_transactions.amount))::int as "creditsSpent",
      count(distinct credit_transactions.generation_id)::int as generations
    from credit_transactions
    join users on users.id = credit_transactions.user_id
    where credit_transactions.type in ('generation_hold', 'generation_refund')
      and credit_transactions.created_at >= ${from}
      and credit_transactions.created_at < ${to}
    group by users.id
    having -sum(credit_transactions.amount) > 0
    order by "creditsSpent" desc
    limit ${limit}
  `);

  return rows;
}
