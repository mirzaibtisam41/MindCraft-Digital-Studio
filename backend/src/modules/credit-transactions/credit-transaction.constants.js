export const CREDIT_TRANSACTION_IDEMPOTENCY_KEY_MAX_LENGTH = 200;

export const CREDIT_TRANSACTION_TYPE = {
  SIGNUP_GRANT: 'signup_grant',
  ADMIN_CREDIT: 'admin_credit',
  ADMIN_DEBIT: 'admin_debit',
  GENERATION_HOLD: 'generation_hold',
  GENERATION_REFUND: 'generation_refund',
};

export const CREDIT_TRANSACTION_TYPES = Object.values(CREDIT_TRANSACTION_TYPE);

export const NOT_ENOUGH_CREDITS_MESSAGE = 'Not enough credits for this change';
