export async function checkHealthController(_request, reply) {
  return reply.send({ status: 'ok', uptime: process.uptime() });
}
