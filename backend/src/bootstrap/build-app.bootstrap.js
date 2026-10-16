import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { buildAppConfig, buildPinoConfig } from '#src/config/index.js';
import { registerPlugins } from '#src/plugins/index.js';
import { registerRoutes } from '#src/modules/index.js';

export function buildApp({
  storage,
  openai,
  vision,
  promptEnhancer,
  mailer,
} = {}) {
  const appConfig = buildAppConfig();

  const fastify = Fastify({
    logger: buildPinoConfig({ appConfig }),
    genReqId: () => randomUUID(),
  });

  registerPlugins({
    fastify,
    appConfig,
    storage,
    openai,
    vision,
    promptEnhancer,
    mailer,
  });
  fastify.register(registerRoutes);

  return fastify;
}
