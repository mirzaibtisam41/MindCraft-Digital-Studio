export function buildListenConfig({ appConfig }) {
  return { port: appConfig.PORT, host: appConfig.HOST };
}
