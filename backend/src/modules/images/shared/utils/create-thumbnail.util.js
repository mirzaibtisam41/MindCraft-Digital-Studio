import sharp from 'sharp';

export function createThumbnailUtil({ fileBuffer }) {
  return sharp(fileBuffer)
    .rotate()
    .resize({
      width: 400,
      height: 400,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 75 })
    .toBuffer();
}
