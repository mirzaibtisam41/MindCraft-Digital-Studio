import {
  AI_IMAGE_PROVIDER,
  AI_IMAGE_PROVIDERS,
  COOKIE_SAME_SITE,
  COOKIE_SAME_SITES,
  ENVIRONMENT,
  ENVIRONMENTS,
  LOG_LEVEL,
  LOG_LEVELS,
  MAIL_PROVIDER,
  MAIL_PROVIDERS,
  OPENAI_IMAGE_MODEL,
  OPENAI_TEXT_MODEL,
  OPENAI_TEXT_MODELS,
} from '#src/constants/index.js';

const JWT_SECRET_MIN_LENGTH = 32;

export const envSchemaConfig = {
  type: 'object',
  required: [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'OPENAI_API_KEY',
    'STORAGE_R2_ACCOUNT_ID',
    'STORAGE_R2_ACCESS_KEY_ID',
    'STORAGE_R2_SECRET_ACCESS_KEY',
    'STORAGE_R2_BUCKET',
  ],
  properties: {
    NODE_ENV: {
      type: 'string',
      enum: ENVIRONMENTS,
      default: ENVIRONMENT.DEVELOPMENT,
    },
    LOG_LEVEL: { type: 'string', enum: LOG_LEVELS, default: LOG_LEVEL.INFO },
    PORT: { type: 'number', minimum: 1, maximum: 65535, default: 8000 },
    HOST: { type: 'string', default: '0.0.0.0' },
    CORS_ORIGIN: { type: 'string', default: 'http://localhost:3000' },
    CLIENT_APP_URL: { type: 'string', default: 'http://localhost:3000' },
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
      default: COOKIE_SAME_SITE.LAX,
    },
    MAIL_PROVIDER: {
      type: 'string',
      enum: MAIL_PROVIDERS,
      default: MAIL_PROVIDER.CONSOLE,
    },
    MAIL_FROM: {
      type: 'string',
      default: 'Mindcraft Digital Studio <no-reply@localhost>',
    },
    RESEND_API_KEY: { type: 'string' },
    AI_IMAGE_PROVIDER: {
      type: 'string',
      enum: AI_IMAGE_PROVIDERS,
      default: AI_IMAGE_PROVIDER.OPENAI,
    },
    OPENAI_API_KEY: { type: 'string', minLength: 1 },
    OPENAI_IMAGE_MODEL: {
      type: 'string',
      default: OPENAI_IMAGE_MODEL.GPT_IMAGE_1_MINI,
    },
    OPENAI_TEXT_MODEL: {
      type: 'string',
      enum: OPENAI_TEXT_MODELS,
      default: OPENAI_TEXT_MODEL.GPT_5_NANO,
    },
    OPENAI_TIMEOUT_MS: { type: 'number', minimum: 1000, default: 120000 },
    OPENAI_MAX_RETRIES: { type: 'number', minimum: 0, maximum: 5, default: 2 },
    STORAGE_R2_ACCOUNT_ID: { type: 'string', minLength: 1 },
    STORAGE_R2_ACCESS_KEY_ID: { type: 'string', minLength: 1 },
    STORAGE_R2_SECRET_ACCESS_KEY: { type: 'string', minLength: 1 },
    STORAGE_R2_BUCKET: { type: 'string', minLength: 1 },
    STORAGE_SIGNED_URL_TTL_SECONDS: {
      type: 'number',
      minimum: 30,
      maximum: 3600,
      default: 300,
    },
  },
  allOf: [
    {
      if: { properties: { MAIL_PROVIDER: { const: MAIL_PROVIDER.RESEND } } },
      then: {
        required: ['RESEND_API_KEY'],
        properties: { RESEND_API_KEY: { type: 'string', minLength: 1 } },
      },
    },
    {
      if: { properties: { NODE_ENV: { const: ENVIRONMENT.PRODUCTION } } },
      then: {
        properties: {
          MAIL_PROVIDER: { type: 'string', const: MAIL_PROVIDER.RESEND },
        },
      },
    },
  ],
};
