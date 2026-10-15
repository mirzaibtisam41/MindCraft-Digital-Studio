import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '#src/database/schema.js';

async function registerDatabase(fastify) {
  await fastify.register(fastifyPostgres, {
    connectionString: fastify.config.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
  });

  fastify.pg.pool.on('error', (error) => {
    fastify.log.error(error, 'Database pool error');
  });

  await fastify.pg.query('SELECT 1');
  fastify.log.info('Database connected');

  const db = drizzle(fastify.pg.pool, { schema, casing: 'snake_case' });

  fastify.decorate('db', db);
}

export const databasePlugin = fp(registerDatabase);
