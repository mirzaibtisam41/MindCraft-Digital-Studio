export function buildCorsConfig({ appConfig }) {
  return {
    origin: appConfig.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  };
}
