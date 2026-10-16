import { and, gte, lt, sql } from 'drizzle-orm';

export function localDaySqlUtil({ column, timezone }) {
  return sql`to_char(${column} at time zone ${timezone}, 'YYYY-MM-DD')`;
}

export function isInLocalRangeSqlUtil({ column, range }) {
  return and(
    gte(column, sql`${range.from}::timestamp at time zone ${range.timezone}`),
    lt(column, sql`${range.to}::timestamp at time zone ${range.timezone}`),
  );
}
