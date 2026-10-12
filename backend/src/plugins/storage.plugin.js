import fp from 'fastify-plugin';
import { S3Client } from '@aws-sdk/client-s3';
import {
  buildStorageClientConfig,
  buildStorageDriverConfig,
} from '#src/config/index.js';
import { createR2StorageDriver } from '#src/modules/storage/drivers/index.js';

async function registerStorage(fastify) {
  const client = new S3Client(
    buildStorageClientConfig({ appConfig: fastify.config }),
  );

  const storage = createR2StorageDriver({
    client,
    ...buildStorageDriverConfig({ appConfig: fastify.config }),
  });

  fastify.decorate('storage', storage);

  fastify.addHook('onClose', async () => {
    client.destroy();
  });
}

export const storagePlugin = fp(registerStorage);
