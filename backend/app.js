import Fastify from 'fastify';
import { buildAppConfig, buildFastifyConfig } from './src/config/index.js';
import {
  configPlugin,
  cookiePlugin,
  corsPlugin,
  databasePlugin,
  errorHandlersPlugin,
  chatModelPlugin,
  helmetPlugin,
  jwtPlugin,
  openaiPlugin,
  rateLimitPlugin,
  replySuccessPlugin,
  storagePlugin,
} from './src/plugins/index.js';
import { registerRoutes } from './src/modules/index.js';

export function buildApp() {
  const appConfig = buildAppConfig();
  const fastify = Fastify(buildFastifyConfig({ appConfig }));

  fastify.register(configPlugin, { appConfig });
  fastify.register(databasePlugin);
  fastify.register(openaiPlugin);
  fastify.register(chatModelPlugin);
  fastify.register(storagePlugin);
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
