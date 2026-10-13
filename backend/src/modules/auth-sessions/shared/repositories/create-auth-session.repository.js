import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function createAuthSessionRepository({ db, data }) {
  const [session] = await db
    .insert(authSessions)
    .values(data)
    .returning({ id: authSessions.id });

  return session;
}
