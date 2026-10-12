import { paginationQueryProperties } from '#src/modules/admin/shared/schemas/pagination-query.schema.js';

export const listUserCreditTransactionsQuerySchema = {
  type: 'object',
  properties: paginationQueryProperties,
  additionalProperties: false,
};
