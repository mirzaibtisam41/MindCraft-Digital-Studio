export function buildServerListenConfig({ appConfig }) {
  return { port: appConfig.PORT, host: appConfig.HOST };
}
