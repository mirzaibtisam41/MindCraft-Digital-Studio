import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export function buildR2StorageIntegration({ appConfig }) {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${appConfig.STORAGE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: appConfig.STORAGE_R2_ACCESS_KEY_ID,
      secretAccessKey: appConfig.STORAGE_R2_SECRET_ACCESS_KEY,
    },
  });
  const bucket = appConfig.STORAGE_R2_BUCKET;

  return {
    async uploadFile({ key, body, contentType }) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    },

    async deleteFile({ key }) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },

    createSignedUrl({ key }) {
      return getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 3600 },
      );
    },

    close() {
      client.destroy();
    },
  };
}
