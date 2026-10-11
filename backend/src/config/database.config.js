export function buildDatabaseConfig({ appConfig }) {
  return {
    connectionString: appConfig.DATABASE_URL,
    max: appConfig.DATABASE_POOL_MAX,
    connectionTimeoutMillis: appConfig.DATABASE_CONNECTION_TIMEOUT_MS,
  };
}
