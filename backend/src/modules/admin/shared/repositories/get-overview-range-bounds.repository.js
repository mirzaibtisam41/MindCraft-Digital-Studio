import { sql } from 'drizzle-orm';

export async function getOverviewRangeBoundsRepository({ db, days, timezone }) {
  const { rows } = await db.execute(sql`
    select
      range_start as "from",
      now() as "to",
      range_start - make_interval(days => ${days}::int) as "previousFrom"
    from (
      select (date_trunc('day', now() at time zone ${timezone})
        - make_interval(days => ${days - 1}::int)) at time zone ${timezone} as range_start
    ) as bounds
  `);

  const row = rows[0];

  return {
    from: new Date(row.from),
    to: new Date(row.to),
    previousFrom: new Date(row.previousFrom),
  };
}
