import {
  ADMIN_PAGE_SIZE_DEFAULT,
  ADMIN_PAGE_SIZE_MAX,
} from '#src/modules/admin/admin.constants.js';

export const paginationQueryProperties = {
  page: { type: 'integer', minimum: 1, default: 1 },
  pageSize: {
    type: 'integer',
    minimum: 1,
    maximum: ADMIN_PAGE_SIZE_MAX,
    default: ADMIN_PAGE_SIZE_DEFAULT,
  },
};
