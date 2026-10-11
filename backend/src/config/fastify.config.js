import { pinoLoggerConfig } from '#src/config/pino.config.js';

export function buildFastifyConfig() {
  return {
    logger: pinoLoggerConfig,
  };
}
