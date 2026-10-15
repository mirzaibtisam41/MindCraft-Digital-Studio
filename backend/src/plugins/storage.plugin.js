import fp from 'fastify-plugin';
import { buildR2StorageIntegration } from '#src/integrations/index.js';

async function registerStorage(fastify, { storage }) {
  const fileStorage =
    storage ?? buildR2StorageIntegration({ appConfig: fastify.config });

  fastify.decorate('storage', fileStorage);

  fastify.addHook('onClose', async () => {
    fileStorage.close();
  });
}

export const storagePlugin = fp(registerStorage);
