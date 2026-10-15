import { updateUserRoleService } from '#src/modules/users/features/update-user-role/update-user-role.service.js';

export async function updateUserRoleController(request, reply) {
  const user = await updateUserRoleService({
    db: request.server.db,
    id: request.params.userId,
    role: request.body.role,
    adminId: request.user.id,
  });

  return reply.success({
    data: { user },
    message: `User role changed to ${user.role}`,
  });
}
