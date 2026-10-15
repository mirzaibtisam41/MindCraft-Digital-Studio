const UNIQUE_VIOLATION_CODE = '23505';

const FOREIGN_KEY_VIOLATION_CODES = ['23503', '23001'];

function readPostgresErrorCode(error) {
  return error?.cause?.code ?? error?.code;
}

export function isUniqueViolationErrorUtil({ error }) {
  return readPostgresErrorCode(error) === UNIQUE_VIOLATION_CODE;
}

export function isForeignKeyViolationErrorUtil({ error }) {
  return FOREIGN_KEY_VIOLATION_CODES.includes(readPostgresErrorCode(error));
}
