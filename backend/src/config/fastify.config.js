import { randomUUID } from 'node:crypto';
import { buildPinoConfig } from './pino.config.js';

export function buildFastifyConfig({ appConfig }) {
  return {
    logger: buildPinoConfig({ appConfig }),
    genReqId: () => randomUUID(),
  };
}
