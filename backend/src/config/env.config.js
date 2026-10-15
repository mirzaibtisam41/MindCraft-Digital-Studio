import envSchema from 'env-schema';
import { ENVIRONMENT, ENVIRONMENTS } from '#src/constants/index.js';

const JWT_SECRET_MIN_LENGTH = 32;

const LOG_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
];

const COOKIE_SAME_SITES = ['lax', 'strict', 'none'];

export const envSchemaConfig = {
  type: 'object',
  required: ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_ACCESS_SECRET'],
  properties: {
    NODE_ENV: {
      type: 'string',
      enum: ENVIRONMENTS,
      default: ENVIRONMENT.DEVELOPMENT,
    },
    LOG_LEVEL: { type: 'string', enum: LOG_LEVELS, default: 'info' },
    PORT: { type: 'number', minimum: 1, maximum: 65535, default: 8000 },
    HOST: { type: 'string', default: '0.0.0.0' },
    CORS_ORIGIN: { type: 'string', default: 'http://localhost:3000' },
    RATE_LIMIT_MAX: { type: 'number', minimum: 1, default: 100 },
    RATE_LIMIT_WINDOW_MS: { type: 'number', minimum: 1000, default: 60000 },
    SHUTDOWN_TIMEOUT_MS: { type: 'number', minimum: 1000, default: 10000 },
    DATABASE_URL: { type: 'string', minLength: 1 },
    DATABASE_POOL_MAX: { type: 'number', minimum: 1, default: 10 },
    DATABASE_CONNECTION_TIMEOUT_MS: {
      type: 'number',
      minimum: 1000,
      default: 5000,
    },
    JWT_ACCESS_SECRET: { type: 'string', minLength: JWT_SECRET_MIN_LENGTH },
    JWT_ACCESS_EXPIRES_IN: { type: 'string', default: '15m' },
    REFRESH_TOKEN_TTL_DAYS: { type: 'number', minimum: 1, default: 30 },
    COOKIE_SAME_SITE: {
      type: 'string',
      enum: COOKIE_SAME_SITES,
      default: 'lax',
    },
  },
};

export function buildAppConfig() {
  return envSchema({ schema: envSchemaConfig });
}
