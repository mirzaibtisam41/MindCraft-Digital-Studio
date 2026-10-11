import Fastify from 'fastify';
import { buildAppConfig, buildFastifyConfig } from './src/config/index.js';
import {
  configPlugin,
  corsPlugin,
  databasePlugin,
  errorHandlersPlugin,
  helmetPlugin,
  rateLimitPlugin,
  replySuccessPlugin,
} from './src/plugins/index.js';
import { registerRoutes } from './src/modules/index.js';

export function buildApp() {
  const appConfig = buildAppConfig();
  const fastify = Fastify(buildFastifyConfig({ appConfig }));

  fastify.register(configPlugin, { appConfig });
  fastify.register(databasePlugin);
  fastify.register(helmetPlugin);
  fastify.register(corsPlugin);
  fastify.register(rateLimitPlugin);
  fastify.register(errorHandlersPlugin);
  fastify.register(replySuccessPlugin);
  fastify.register(registerRoutes);

  return fastify;
}
