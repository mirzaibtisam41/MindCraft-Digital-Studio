import argon2 from 'argon2';

export function verifyPasswordUtil({ password, passwordHash }) {
  return argon2.verify(passwordHash, password);
}
