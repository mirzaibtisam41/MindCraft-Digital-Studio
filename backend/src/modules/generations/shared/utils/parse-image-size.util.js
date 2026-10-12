export function parseImageSizeUtil(size) {
  const [width, height] = size.split('x').map(Number);

  return { width, height };
}
