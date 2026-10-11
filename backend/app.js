import Fastify from 'fastify';
import { buildFastifyConfig } from './src/config/index.js';
import { envPlugin, replySuccessPlugin } from './src/plugins/index.js';
import { registerRoutes } from './src/modules/index.js';

export function buildApp() {
  const fastify = Fastify(buildFastifyConfig());

  fastify.register(envPlugin);
  fastify.register(replySuccessPlugin);
  fastify.register(registerRoutes);

  return fastify;
}
