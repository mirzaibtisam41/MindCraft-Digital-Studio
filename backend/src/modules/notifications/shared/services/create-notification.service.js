import { NOTIFICATION_TYPE } from '#src/modules/notifications/notification.constants.js';
import { createNotificationRepository } from '#src/modules/notifications/shared/repositories/index.js';
import { readUserSettingsService } from '#src/modules/user-settings/shared/services/index.js';

const PREFERENCE_BY_TYPE = {
  [NOTIFICATION_TYPE.GENERATION_FAILED]: 'notifyGenerationFailed',
  [NOTIFICATION_TYPE.ANALYSIS_FAILED]: 'notifyGenerationFailed',
  [NOTIFICATION_TYPE.CREDITS_ADDED]: 'notifyCreditChanges',
  [NOTIFICATION_TYPE.CREDITS_REMOVED]: 'notifyCreditChanges',
  [NOTIFICATION_TYPE.LOW_CREDITS]: 'notifyLowCredits',
};

export async function createNotificationService({
  db,
  userId,
  type,
  title,
  body = null,
  link = null,
  settings,
}) {
  const userSettings =
    settings ?? (await readUserSettingsService({ db, userId }));

  if (!userSettings[PREFERENCE_BY_TYPE[type]]) return null;

  return createNotificationRepository({
    db,
    data: { userId, type, title, body, link },
  });
}

function formatCredits(credits) {
  return `${credits} ${credits === 1 ? 'credit' : 'credits'}`;
}

export async function notifyIfCreditsRanLowService({
  db,
  userId,
  balanceBefore,
  balanceAfter,
}) {
  const settings = await readUserSettingsService({ db, userId });
  const threshold = settings.lowCreditThreshold;

  if (balanceBefore < threshold || balanceAfter >= threshold) return null;

  return createNotificationService({
    db,
    userId,
    type: NOTIFICATION_TYPE.LOW_CREDITS,
    title: `You have ${formatCredits(balanceAfter)} left`,
    body: `Your balance went below ${formatCredits(threshold)}.`,
    link: '/app/credits',
    settings,
  });
}

export function notifyCreditsRefundedService({
  db,
  userId,
  type,
  credits,
  what,
  link,
}) {
  return createNotificationService({
    db,
    userId,
    type,
    title: credits
      ? `${what} failed · ${formatCredits(credits)} refunded`
      : `${what} failed`,
    body: credits
      ? 'Nothing was charged for it. You can try again.'
      : 'You can try again.',
    link,
  });
}
