const CORNER_RADIUS = 4;

const SEGMENT_GAP = 2;

function buildPath({ x, y, width, height, roundTop }) {
  if (!roundTop) return `M${x},${y}h${width}v${height}h${-width}Z`;

  const radius = Math.min(CORNER_RADIUS, width / 2, height);

  return [
    `M${x},${y + height}`,
    `V${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `H${x + width - radius}`,
    `Q${x + width},${y} ${x + width},${y + radius}`,
    `V${y + height}`,
    'Z',
  ].join(' ');
}

export function createStackedBarShape({ dataKey, stackKeys, fill }) {
  const position = stackKeys.indexOf(dataKey);
  const keysAbove = stackKeys.slice(position + 1);
  const keysBelow = stackKeys.slice(0, position);

  return function StackedBarShape({ x, y, width, height, payload }) {
    if (!height || height <= 0) return null;

    const hasSegmentBelow = keysBelow.some((key) => payload[key] > 0);
    const hasSegmentAbove = keysAbove.some((key) => payload[key] > 0);
    const gap = hasSegmentBelow ? SEGMENT_GAP : 0;
    const segmentHeight = Math.max(height - gap, 1);

    return (
      <path
        d={buildPath({
          x,
          y,
          width,
          height: segmentHeight,
          roundTop: !hasSegmentAbove,
        })}
        fill={fill}
      />
    );
  };
}
