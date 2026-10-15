import { StatusCodes } from 'http-status-codes';
import { BadRequestError, PayloadTooLargeError } from '#src/utils/index.js';
import { uploadImageService } from '#src/modules/images/features/upload-image/upload-image.service.js';

async function readUploadedFile(request) {
  const file = await request.file();

  if (!file) {
    throw new BadRequestError('Choose an image to upload');
  }

  try {
    return { fileBuffer: await file.toBuffer(), fileName: file.filename };
  } catch (error) {
    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      throw new PayloadTooLargeError('Use an image under 25 MB');
    }

    throw error;
  }
}

export async function uploadImageController(request, reply) {
  const { fileBuffer, fileName } = await readUploadedFile(request);

  const image = await uploadImageService({
    db: request.server.db,
    storage: request.server.storage,
    log: request.log,
    userId: request.user.id,
    fileBuffer,
    fileName,
  });

  return reply.success({
    data: { image },
    message: 'Image uploaded',
    statusCode: StatusCodes.CREATED,
  });
}
