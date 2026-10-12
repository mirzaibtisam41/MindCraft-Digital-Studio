function greatestCommonDivisor(a, b) {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function parsePair({ value, separator }) {
  const [width, height] = value.split(separator).map(Number);
  return { width, height };
}

export function reduceAspectRatioUtil(aspectRatio) {
  const { width, height } = parsePair({ value: aspectRatio, separator: ':' });
  const divisor = greatestCommonDivisor(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function getAspectRatioOfSizeUtil(size) {
  const { width, height } = parsePair({ value: size, separator: 'x' });
  const divisor = greatestCommonDivisor(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function findSizeByAspectRatioUtil({ aspectRatio, sizes }) {
  const reduced = reduceAspectRatioUtil(aspectRatio);
  return sizes.find((size) => getAspectRatioOfSizeUtil(size) === reduced);
}

export function findNearestSizeByAspectRatioUtil({ aspectRatio, sizes }) {
  const { width, height } = parsePair({ value: aspectRatio, separator: ':' });
  const target = Math.log(width / height);

  return sizes.reduce(
    (nearest, size) => {
      const pair = parsePair({ value: size, separator: 'x' });
      const distance = Math.abs(Math.log(pair.width / pair.height) - target);
      return distance < nearest.distance ? { size, distance } : nearest;
    },
    { size: sizes[0], distance: Infinity },
  ).size;
}

export function listSupportedAspectRatiosUtil(sizes) {
  return sizes.map(getAspectRatioOfSizeUtil);
}
