import Fastify from 'fastify';
import { buildFastifyConfig } from './src/config/index.js';
import {
  corsPlugin,
  envPlugin,
  errorHandlersPlugin,
  helmetPlugin,
  replySuccessPlugin,
} from './src/plugins/index.js';
import { registerRoutes } from './src/modules/index.js';

export function buildApp() {
  const fastify = Fastify(buildFastifyConfig());

  fastify.register(envPlugin);
  fastify.register(helmetPlugin);
  fastify.register(corsPlugin);
  fastify.register(errorHandlersPlugin);
  fastify.register(replySuccessPlugin);
  fastify.register(registerRoutes);

  return fastify;
}
