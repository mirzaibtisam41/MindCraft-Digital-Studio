import argon2 from 'argon2';

export function hashPasswordUtil({ password }) {
  return argon2.hash(password, { type: argon2.argon2id });
}
