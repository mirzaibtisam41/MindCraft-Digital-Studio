import {
  OVERVIEW_LIST_LIMIT,
  OVERVIEW_RANGE_DAYS,
  OVERVIEW_TIMEZONE_DEFAULT,
  OVERVIEW_TOP_SPENDERS_LIMIT,
} from '#src/modules/admin/admin.constants.js';
import * as adminRepositories from '#src/modules/admin/shared/repositories/index.js';
import * as auditLogRepositories from '#src/modules/audit-logs/shared/repositories/index.js';
import * as generationRepositories from '#src/modules/generations/shared/repositories/index.js';

const SUPPORTED_TIMEZONES = new Set(Intl.supportedValuesOf('timeZone'));

function resolveTimezone(timezone) {
  return SUPPORTED_TIMEZONES.has(timezone)
    ? timezone
    : OVERVIEW_TIMEZONE_DEFAULT;
}

function pairKpis(current, previous) {
  return Object.fromEntries(
    Object.keys(current).map((key) => [
      key,
      { current: current[key], previous: previous[key] },
    ]),
  );
}

async function measureDatabaseLatency({ db }) {
  const startedAt = performance.now();

  await adminRepositories.pingDatabaseRepository({ db });

  return Math.round(performance.now() - startedAt);
}

function buildPlatformInfo({ appConfig, databaseLatencyMs }) {
  return {
    databaseLatencyMs,
    uptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
    environment: appConfig.NODE_ENV,
    imageProvider: appConfig.AI_IMAGE_PROVIDER,
    textModel: appConfig.OPENAI_TEXT_MODEL,
    storageBucket: appConfig.STORAGE_R2_BUCKET,
  };
}

export async function getOverviewService({ db, appConfig, range, timezone }) {
  const resolvedTimezone = resolveTimezone(timezone);
  const days = OVERVIEW_RANGE_DAYS[range];
  const bounds = await adminRepositories.getOverviewRangeBoundsRepository({
    db,
    days,
    timezone: resolvedTimezone,
  });
  const current = { db, from: bounds.from, to: bounds.to };

  const [
    totals,
    currentStats,
    previousStats,
    daily,
    modelUsage,
    failureReasons,
    topSpenders,
    recentGenerations,
    recentAuditLogs,
    databaseLatencyMs,
  ] = await Promise.all([
    adminRepositories.getAdminTotalsRepository({ db }),
    adminRepositories.getAdminPeriodStatsRepository(current),
    adminRepositories.getAdminPeriodStatsRepository({
      db,
      from: bounds.previousFrom,
      to: bounds.from,
    }),
    adminRepositories.getAdminDailyActivityRepository({
      ...current,
      timezone: resolvedTimezone,
    }),
    adminRepositories.getAdminModelUsageRepository(current),
    adminRepositories.getAdminFailureReasonsRepository(current),
    adminRepositories.getAdminTopSpendersRepository({
      ...current,
      limit: OVERVIEW_TOP_SPENDERS_LIMIT,
    }),
    generationRepositories.listGenerationsForAdminRepository({
      db,
      limit: OVERVIEW_LIST_LIMIT,
      offset: 0,
    }),
    auditLogRepositories.listAuditLogsRepository({
      db,
      limit: OVERVIEW_LIST_LIMIT,
      offset: 0,
    }),
    measureDatabaseLatency({ db }),
  ]);

  return {
    range: {
      key: range,
      days,
      timezone: resolvedTimezone,
      from: bounds.from,
      to: bounds.to,
      previousFrom: bounds.previousFrom,
    },
    totals,
    kpis: pairKpis(currentStats, previousStats),
    daily,
    modelUsage,
    failureReasons,
    topSpenders,
    recentGenerations: recentGenerations.items,
    recentAuditLogs: recentAuditLogs.items,
    platform: buildPlatformInfo({ appConfig, databaseLatencyMs }),
  };
}
