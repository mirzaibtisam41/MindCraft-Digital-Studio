import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { buildAppConfig, buildPinoConfig } from '#src/config/index.js';
import { registerPlugins } from '#src/plugins/index.js';
import { registerRoutes } from '#src/modules/index.js';

export function buildApp({ storage, openai, vision } = {}) {
  const appConfig = buildAppConfig();

  const fastify = Fastify({
    logger: buildPinoConfig({ appConfig }),
    genReqId: () => randomUUID(),
  });

  registerPlugins({ fastify, appConfig, storage, openai, vision });
  fastify.register(registerRoutes);

  return fastify;
}
