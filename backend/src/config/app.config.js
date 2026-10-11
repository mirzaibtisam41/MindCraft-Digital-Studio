import envSchema from 'env-schema';
import { envSchemaConfig } from './env-schema.config.js';

export function buildAppConfig() {
  return envSchema({ schema: envSchemaConfig });
}
