export function buildPaginationUtil({ page, pageSize }) {
  return { limit: pageSize, offset: (page - 1) * pageSize };
}

export function buildPageMetaUtil({ page, pageSize, total }) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
