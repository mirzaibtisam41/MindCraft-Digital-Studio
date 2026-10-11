import { pinoConfig } from './pino.config.js';

export function buildFastifyConfig() {
  return {
    logger: pinoConfig,
  };
}
