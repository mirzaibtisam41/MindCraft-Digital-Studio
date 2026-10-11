export function buildJwtConfig({ appConfig }) {
  return {
    secret: appConfig.JWT_ACCESS_SECRET,
    sign: { expiresIn: appConfig.JWT_ACCESS_EXPIRES_IN },
  };
}
