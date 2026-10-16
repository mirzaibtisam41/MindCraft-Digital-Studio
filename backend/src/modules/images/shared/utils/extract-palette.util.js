import sharp from 'sharp';

function toHex(value) {
  return value.toString(16).padStart(2, '0');
}

export async function extractPaletteUtil({ fileBuffer, colorCount = 5 }) {
  const { data, info } = await sharp(fileBuffer)
    .resize(64, 64, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map();

  for (let index = 0; index < data.length; index += info.channels) {
    const key = [0, 1, 2].map((offset) => data[index + offset] >> 4).join(',');
    const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };

    bucket.count += 1;
    bucket.red += data[index];
    bucket.green += data[index + 1];
    bucket.blue += data[index + 2];
    buckets.set(key, bucket);
  }

  const totalPixels = data.length / info.channels;

  return [...buckets.values()]
    .sort((first, second) => second.count - first.count)
    .slice(0, colorCount)
    .map((bucket) => ({
      hex: `#${[bucket.red, bucket.green, bucket.blue]
        .map((sum) => toHex(Math.round(sum / bucket.count)))
        .join('')}`,
      share: Math.round((bucket.count / totalPixels) * 100),
    }));
}
