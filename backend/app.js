import Fastify from 'fastify';
import { buildFastifyConfig } from './src/config/index.js';
import { validateEnvPlugin } from './src/plugins/index.js';

export function buildApp() {
  const fastify = Fastify(buildFastifyConfig());

  fastify.register(validateEnvPlugin);

  return fastify;
}
