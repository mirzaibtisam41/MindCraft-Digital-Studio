export async function getMyProfileController(request, reply) {
  return reply.success({ data: { user: request.user } });
}
