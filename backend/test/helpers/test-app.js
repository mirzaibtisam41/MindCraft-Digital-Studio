import { randomInt, randomUUID } from 'node:crypto';
import { buildApp } from '#src/bootstrap/index.js';
import { REFRESH_COOKIE_NAME } from '#src/config/index.js';
import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { createMemoryStorage } from './memory-storage.js';

export const TEST_PASSWORD = 'secret123';

function randomIpAddress() {
  return `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`;
}

function readRefreshCookie(response) {
  const setCookie = [response.headers['set-cookie'] ?? []].flat().join(';');

  return setCookie.match(new RegExp(`${REFRESH_COOKIE_NAME}=([^;]*)`))?.[1];
}

export async function buildTestApp({ env = {} } = {}) {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
  Object.assign(process.env, env);

  const storage = createMemoryStorage();
  const app = buildApp({ storage });
  const createdEmails = [];

  app.register(
    async (adminRoutes) => {
      adminRoutes.addHook('onRequest', checkUserIsLoggedInHook);
      adminRoutes.addHook('onRequest', checkUserIsAdminHook);
      adminRoutes.get('/ping', async () => ({ ok: true }));
    },
    { prefix: '/api/test-admin' },
  );

  await app.ready();

  async function sendRequest({
    method,
    url,
    payload,
    accessToken,
    refreshToken,
  }) {
    const response = await app.inject({
      method,
      url,
      payload,
      remoteAddress: randomIpAddress(),
      headers: {
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...(refreshToken
          ? { cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}` }
          : {}),
      },
    });

    return {
      statusCode: response.statusCode,
      body: response.json(),
      refreshCookie: readRefreshCookie(response),
    };
  }

  function makeEmail() {
    const email = `test-${randomUUID()}@example.com`;
    createdEmails.push(email);

    return email;
  }

  async function registerUser({
    email = makeEmail(),
    name = 'Test User',
  } = {}) {
    await sendRequest({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name, email, password: TEST_PASSWORD },
    });

    return email;
  }

  async function loginUser({ email }) {
    const response = await sendRequest({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password: TEST_PASSWORD },
    });

    return {
      accessToken: response.body.data.accessToken,
      refreshToken: response.refreshCookie,
      user: response.body.data.user,
    };
  }

  async function registerAndLogin() {
    const email = await registerUser();

    return { email, ...(await loginUser({ email })) };
  }

  async function registerAndLoginAsAdmin() {
    const email = await registerUser();
    await app.pg.query("UPDATE users SET role = 'admin' WHERE email = $1", [
      email,
    ]);

    return { email, ...(await loginUser({ email })) };
  }

  async function runSql(text, values = []) {
    const result = await app.pg.query(text, values);

    return result.rows;
  }

  async function close() {
    if (createdEmails.length > 0) {
      await runSql('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
    }

    await app.close();
  }

  return {
    app,
    storage,
    sendRequest,
    makeEmail,
    registerUser,
    loginUser,
    registerAndLogin,
    registerAndLoginAsAdmin,
    runSql,
    close,
  };
}
