export function buildStorageClientConfig({ appConfig }) {
  return {
    region: 'auto',
    endpoint: `https://${appConfig.STORAGE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: appConfig.STORAGE_R2_ACCESS_KEY_ID,
      secretAccessKey: appConfig.STORAGE_R2_SECRET_ACCESS_KEY,
    },
  };
}

export function buildStorageDriverConfig({ appConfig }) {
  return {
    bucket: appConfig.STORAGE_R2_BUCKET,
    signedUrlTtlSeconds: appConfig.STORAGE_SIGNED_URL_TTL_SECONDS,
  };
}
