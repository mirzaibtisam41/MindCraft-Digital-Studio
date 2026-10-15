import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

async function registerJwt(fastify) {
  await fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_ACCESS_SECRET,
    sign: { expiresIn: fastify.config.JWT_ACCESS_EXPIRES_IN },
  });
}

export const jwtPlugin = fp(registerJwt);
