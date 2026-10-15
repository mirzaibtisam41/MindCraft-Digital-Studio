import './src/bootstrap/load-env.bootstrap.js';
import { defineConfig } from 'drizzle-kit';
import { buildAppConfig } from './src/config/index.js';

const appConfig = buildAppConfig();

export default defineConfig({
  schema: './src/database/schema.js',
  out: './database/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: appConfig.DATABASE_URL,
  },
});
