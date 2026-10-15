import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32;

export function generateTokenUtil() {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashTokenUtil({ token }) {
  return createHash('sha256').update(token).digest('hex');
}
