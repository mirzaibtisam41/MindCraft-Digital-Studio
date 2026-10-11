import {
  SESSION_IP_ADDRESS_MAX_LENGTH,
  SESSION_USER_AGENT_MAX_LENGTH,
} from '#src/modules/sessions/session.constants.js';

export function getClientInfoUtil({ request }) {
  const userAgent = request.headers['user-agent'];

  return {
    userAgent: userAgent?.slice(0, SESSION_USER_AGENT_MAX_LENGTH) ?? null,
    ipAddress: request.ip?.slice(0, SESSION_IP_ADDRESS_MAX_LENGTH) ?? null,
  };
}
