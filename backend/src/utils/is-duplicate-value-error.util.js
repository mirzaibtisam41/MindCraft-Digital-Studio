const UNIQUE_VIOLATION_CODE = '23505';

export function isDuplicateValueErrorUtil({ error }) {
  const pgError = error?.cause?.code ? error.cause : error;

  return pgError?.code === UNIQUE_VIOLATION_CODE;
}
