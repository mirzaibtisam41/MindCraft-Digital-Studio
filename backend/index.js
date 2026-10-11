import './src/bootstrap/index.js';
import { buildApp } from './app.js';
import { buildListenConfig } from './src/config/index.js';
import { SHUTDOWN_SIGNALS } from './src/constants/index.js';
import { gracefulShutdownHandler } from './src/handlers/index.js';

const fastify = buildApp();

try {
  await fastify.ready();

  await fastify.listen(buildListenConfig({ appConfig: fastify.config }));

  for (const signal of SHUTDOWN_SIGNALS) {
    process.once(signal, () => gracefulShutdownHandler({ fastify, signal }));
  }
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
