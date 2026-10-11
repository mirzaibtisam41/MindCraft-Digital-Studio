import { pinoLoggerConfig } from '#src/config/logger/pino.config.js';

export function buildFastifyConfig() {
  return {
    logger: pinoLoggerConfig,
  };
}
