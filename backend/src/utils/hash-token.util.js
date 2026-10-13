import { createHash } from 'node:crypto';

export function hashTokenUtil({ token }) {
  return createHash('sha256').update(token).digest('hex');
}
