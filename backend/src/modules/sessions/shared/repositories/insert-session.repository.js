import { sessions } from '#src/modules/sessions/session.table.js';

export async function insertSessionRepository({ db, data }) {
  const [session] = await db
    .insert(sessions)
    .values(data)
    .returning({ id: sessions.id });

  return session;
}
