import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';
import { buildAppConfig, buildPinoConfig } from '#src/config/index.js';
import {
  configPlugin,
  cookiePlugin,
  corsPlugin,
  databasePlugin,
  errorHandlersPlugin,
  helmetPlugin,
  jwtPlugin,
  rateLimitPlugin,
  replySuccessPlugin,
} from '#src/plugins/index.js';
import { registerRoutes } from '#src/modules/index.js';

export function buildApp() {
  const appConfig = buildAppConfig();
  const fastify = Fastify({
    logger: buildPinoConfig({ appConfig }),
    genReqId: () => randomUUID(),
  });

  fastify.register(configPlugin, { appConfig });
  fastify.register(databasePlugin);
  fastify.register(helmetPlugin);
  fastify.register(corsPlugin);
  fastify.register(rateLimitPlugin);
  fastify.register(cookiePlugin);
  fastify.register(jwtPlugin);
  fastify.register(errorHandlersPlugin);
  fastify.register(replySuccessPlugin);
  fastify.register(registerRoutes);

  return fastify;
}
