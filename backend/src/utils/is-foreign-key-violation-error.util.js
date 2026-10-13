const POSTGRES_FOREIGN_KEY_VIOLATION_CODES = ['23503', '23001'];

export function isForeignKeyViolationErrorUtil({ error }) {
  const postgresError = error?.cause?.code ? error.cause : error;

  return POSTGRES_FOREIGN_KEY_VIOLATION_CODES.includes(postgresError?.code);
}
