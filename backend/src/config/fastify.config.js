import { randomUUID } from 'node:crypto';
import { buildPinoConfig } from './pino.config.js';

export function buildFastifyConfig() {
  return {
    logger: buildPinoConfig(),
    genReqId: () => randomUUID(),
  };
}
