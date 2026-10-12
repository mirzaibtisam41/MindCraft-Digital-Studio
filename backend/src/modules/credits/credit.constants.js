export const CREDIT_TRANSACTION_TYPE = {
  SIGNUP_GRANT: 'signup_grant',
  GENERATION_HOLD: 'generation_hold',
  GENERATION_REFUND: 'generation_refund',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
};

export const CREDIT_TRANSACTION_TYPES = Object.values(CREDIT_TRANSACTION_TYPE);

export const CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH = 100;

export const CREDIT_NOTE_MAX_LENGTH = 200;

export const INSUFFICIENT_CREDITS_MESSAGE =
  'Insufficient credits for this generation';
