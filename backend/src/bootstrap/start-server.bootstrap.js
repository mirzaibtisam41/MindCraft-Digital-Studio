import { gracefulShutdownHandler } from '#src/handlers/index.js';
import { buildApp } from './build-app.bootstrap.js';

export async function startServer() {
  const fastify = buildApp();

  try {
    await fastify.ready();

    await fastify.listen({
      port: fastify.config.PORT,
      host: fastify.config.HOST,
    });

    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => gracefulShutdownHandler({ fastify, signal }));
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
