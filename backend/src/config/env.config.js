import envSchema from 'env-schema';
import { ENVIRONMENT, ENVIRONMENTS } from '#src/constants/index.js';

const envSchemaConfig = {
  type: 'object',
  required: ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_ACCESS_SECRET'],
  properties: {
    NODE_ENV: {
      type: 'string',
      enum: ENVIRONMENTS,
      default: ENVIRONMENT.DEVELOPMENT,
    },
    LOG_LEVEL: {
      type: 'string',
      enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
    },
    PORT: { type: 'number', minimum: 1, maximum: 65535, default: 8000 },
    CORS_ORIGIN: { type: 'string', default: 'http://localhost:3000' },
    DATABASE_URL: { type: 'string', minLength: 1 },
    JWT_ACCESS_SECRET: { type: 'string', minLength: 32 },
    COOKIE_SAME_SITE: {
      type: 'string',
      enum: ['lax', 'strict', 'none'],
      default: 'lax',
    },
  },
};

export function buildAppConfig() {
  return envSchema({ schema: envSchemaConfig });
}
