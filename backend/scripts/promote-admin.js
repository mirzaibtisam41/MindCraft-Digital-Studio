import '../src/bootstrap/load-env.bootstrap.js';
import pg from 'pg';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { buildAppConfig } from '../src/config/index.js';
import { users } from '../src/modules/users/user.table.js';
import { USER_ROLE } from '../src/modules/users/user.constants.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run admin:promote -- <email>');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: buildAppConfig().DATABASE_URL });
const db = drizzle(pool, { casing: 'snake_case' });

try {
  const [user] = await db
    .update(users)
    .set({ role: USER_ROLE.ADMIN })
    .where(eq(sql`lower(${users.email})`, email))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  if (user) {
    console.log('Promoted to admin:', user);
  } else {
    console.error(`No user found with email ${email}. Register first.`);
    process.exitCode = 1;
  }
} finally {
  await pool.end();
}
