import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { assertValidStorageKey } from '#src/modules/storage/shared/utils/index.js';

export function createR2StorageDriver({ client, bucket, signedUrlTtlSeconds }) {
  return {
    async save({ key, body, contentType }) {
      assertValidStorageKey(key);

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    },

    async read({ key }) {
      assertValidStorageKey(key);

      const response = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );

      return Buffer.from(await response.Body.transformToByteArray());
    },

    async remove({ key }) {
      assertValidStorageKey(key);

      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },

    async getSignedUrl({ key }) {
      assertValidStorageKey(key);

      const url = await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: signedUrlTtlSeconds },
      );

      return {
        url,
        expiresAt: new Date(Date.now() + signedUrlTtlSeconds * 1000),
      };
    },
  };
}
