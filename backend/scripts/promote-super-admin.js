import '../src/bootstrap/index.js';
import pg from 'pg';
import { buildAppConfig } from '../src/config/index.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run admin:promote -- <email>');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: buildAppConfig().DATABASE_URL });

try {
  const { rows } = await pool.query(
    "UPDATE users SET role = 'super_admin', suspended_at = NULL WHERE email = $1 RETURNING id, name, email, role",
    [email],
  );

  if (rows.length === 0) {
    console.error(`No user found with email ${email}. Register first.`);
    process.exitCode = 1;
  } else {
    console.log('Promoted to super_admin:', rows[0]);
  }
} finally {
  await pool.end();
}
