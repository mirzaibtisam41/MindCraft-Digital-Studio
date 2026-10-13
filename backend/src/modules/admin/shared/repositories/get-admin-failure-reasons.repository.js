import { sql } from 'drizzle-orm';

export async function getAdminFailureReasonsRepository({ db, from, to }) {
  const { rows } = await db.execute(sql`
    select coalesce(error_category, 'unknown') as category,
      count(*)::int as count
    from generations
    where status = 'failed' and created_at >= ${from} and created_at < ${to}
    group by 1
    order by count desc
  `);

  return rows;
}
