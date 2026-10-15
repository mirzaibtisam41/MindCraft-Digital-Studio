import { updateUserStatusService } from '#src/modules/users/features/update-user-status/update-user-status.service.js';

export async function updateUserStatusController(request, reply) {
  const user = await updateUserStatusService({
    db: request.server.db,
    id: request.params.userId,
    status: request.body.status,
    adminId: request.user.id,
  });

  return reply.success({
    data: { user },
    message: `User status changed to ${user.status}`,
  });
}
