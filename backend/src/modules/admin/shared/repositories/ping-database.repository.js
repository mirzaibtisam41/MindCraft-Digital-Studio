import { sql } from 'drizzle-orm';

export async function pingDatabaseRepository({ db }) {
  await db.execute(sql`select 1`);
}
