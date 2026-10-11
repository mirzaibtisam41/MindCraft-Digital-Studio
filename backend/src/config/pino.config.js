import { ENVIRONMENT, LOG_LEVEL } from '#src/constants/index.js';

const REDACTED_PATHS = [
  '*.authorization',
  '*.cookie',
  '*.headers.authorization',
  '*.headers.cookie',
  '*.headers["set-cookie"]',
  '*.password',
  '*.newPassword',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.apiKey',
];

export function buildPinoConfig() {
  const config = {
    level: process.env.LOG_LEVEL ?? LOG_LEVEL.INFO,
    redact: { paths: REDACTED_PATHS, censor: '[REDACTED]' },
  };

  if (process.env.NODE_ENV !== ENVIRONMENT.PRODUCTION) {
    config.transport = {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        colorize: true,
        ignore: 'pid,hostname',
      },
    };
  }

  return config;
}
