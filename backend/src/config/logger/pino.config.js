import { ENVIRONMENT } from '#src/constants/index.js';

const isProduction = process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;

export const pinoLoggerConfig = {};

if (!isProduction) {
  pinoLoggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:standard',
      colorize: true,
      ignore: 'pid,hostname',
    },
  };
}
