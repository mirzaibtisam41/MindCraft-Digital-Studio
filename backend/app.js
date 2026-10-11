import Fastify from 'fastify';
import { buildFastifyConfig } from './src/config/index.js';
import { envPlugin } from './src/plugins/index.js';

export function buildApp() {
  const fastify = Fastify(buildFastifyConfig());

  fastify.register(envPlugin);

  return fastify;
}
