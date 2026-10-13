const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

export function isUniqueViolationErrorUtil({ error }) {
  const postgresError = error?.cause?.code ? error.cause : error;

  return postgresError?.code === POSTGRES_UNIQUE_VIOLATION_CODE;
}
