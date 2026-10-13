export async function getMeController(request, reply) {
  return reply.success({ data: { user: request.user } });
}
