import { sql } from 'drizzle-orm';

export async function getAdminDailyActivityRepository({
  db,
  from,
  to,
  timezone,
}) {
  const { rows } = await db.execute(sql`
    with days as (
      select generate_series(
        (${from}::timestamptz at time zone ${timezone})::date,
        (${to}::timestamptz at time zone ${timezone})::date,
        interval '1 day'
      )::date as day
    ),
    generation_days as (
      select (created_at at time zone ${timezone})::date as day,
        count(*) filter (where status = 'completed')::int as completed,
        count(*) filter (where status = 'failed')::int as failed,
        count(*) filter (where status not in ('completed', 'failed'))::int as other
      from generations
      where created_at >= ${from} and created_at < ${to}
      group by 1
    ),
    user_days as (
      select (created_at at time zone ${timezone})::date as day,
        count(*)::int as new_users
      from users
      where created_at >= ${from} and created_at < ${to}
      group by 1
    ),
    image_days as (
      select (created_at at time zone ${timezone})::date as day,
        count(*)::int as images
      from images
      where created_at >= ${from} and created_at < ${to}
      group by 1
    ),
    credit_days as (
      select (created_at at time zone ${timezone})::date as day,
        coalesce(-sum(amount) filter (
          where type in ('generation_hold', 'generation_refund')), 0)::int as credits_spent,
        coalesce(sum(amount) filter (
          where type = 'signup_grant' or (type = 'admin_adjustment' and amount > 0)), 0)::int as credits_issued
      from credit_transactions
      where created_at >= ${from} and created_at < ${to}
      group by 1
    )
    select
      to_char(days.day, 'YYYY-MM-DD') as date,
      coalesce(generation_days.completed, 0) as completed,
      coalesce(generation_days.failed, 0) as failed,
      coalesce(generation_days.other, 0) as other,
      coalesce(user_days.new_users, 0) as "newUsers",
      coalesce(image_days.images, 0) as images,
      coalesce(credit_days.credits_spent, 0) as "creditsSpent",
      coalesce(credit_days.credits_issued, 0) as "creditsIssued"
    from days
    left join generation_days using (day)
    left join user_days using (day)
    left join image_days using (day)
    left join credit_days using (day)
    order by days.day
  `);

  return rows;
}
