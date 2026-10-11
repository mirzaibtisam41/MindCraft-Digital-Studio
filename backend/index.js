import './src/bootstrap/index.js';
import { buildApp } from './app.js';
import { buildServerListenConfig } from './src/config/index.js';

const fastify = buildApp();

try {
  await fastify.ready();

  await fastify.listen(buildServerListenConfig({ appConfig: fastify.config }));
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
