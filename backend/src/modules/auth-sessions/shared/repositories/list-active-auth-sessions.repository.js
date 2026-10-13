import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function listActiveAuthSessionsRepository({ db, userId }) {
  return db
    .select({
      familyId: authSessions.familyId,
      userAgent: authSessions.userAgent,
      ipAddress: authSessions.ipAddress,
      lastActiveAt: authSessions.createdAt,
      expiresAt: authSessions.expiresAt,
    })
    .from(authSessions)
    .where(
      and(
        eq(authSessions.userId, userId),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(authSessions.createdAt));
}
