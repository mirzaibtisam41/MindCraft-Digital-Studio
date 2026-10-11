export async function gracefulShutdownHandler({ fastify, signal }) {
  fastify.log.info(`${signal} received, shutting down`);

  const forceExit = setTimeout(() => {
    fastify.log.error('Shutdown took too long, forcing exit');
    process.exit(1);
  }, fastify.config.SHUTDOWN_TIMEOUT_MS);

  forceExit.unref();

  try {
    await fastify.close();
    fastify.log.info('Server closed');
    process.exit(0);
  } catch (error) {
    fastify.log.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
}
