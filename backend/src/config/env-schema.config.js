import {
  ENVIRONMENT,
  ENVIRONMENTS,
  LOG_LEVEL,
  LOG_LEVELS,
} from '#src/constants/index.js';

export const envSchemaConfig = {
  type: 'object',
  required: ['NODE_ENV', 'PORT'],
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
  },
};
