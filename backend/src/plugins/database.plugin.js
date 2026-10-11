import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import { buildDatabaseConfig } from '#src/config/index.js';

async function registerDatabase(fastify) {
  await fastify.register(
    fastifyPostgres,
    buildDatabaseConfig({ appConfig: fastify.config }),
  );

  fastify.pg.pool.on('error', (error) => {
    fastify.log.error(error, 'Database pool error');
  });

  await fastify.pg.query('SELECT 1');
  fastify.log.info('Database connected');

  const db = drizzle(fastify.pg.pool);

  fastify.decorate('db', db);
}

export const databasePlugin = fp(registerDatabase);
