export function findClosestSize({ sizes, width, height }) {
  if (!width || !height || sizes.length === 0) return null;

  const ratio = width / height;

  return sizes.reduce((closest, size) => {
    const [sizeWidth, sizeHeight] = size.split('x').map(Number);
    const [closestWidth, closestHeight] = closest.split('x').map(Number);

    return Math.abs(sizeWidth / sizeHeight - ratio) <
      Math.abs(closestWidth / closestHeight - ratio)
      ? size
      : closest;
  });
}
