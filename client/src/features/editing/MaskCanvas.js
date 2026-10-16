'use client';

import { useEffect, useRef } from 'react';

function drawStroke(context, stroke) {
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = stroke.size;
  context.beginPath();
  stroke.points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  if (stroke.points.length === 1) {
    context.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y);
  }
  context.stroke();
}

export function buildMaskDataUrl({ width, height, strokes }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  for (const stroke of strokes) {
    context.globalCompositeOperation =
      stroke.mode === 'paint' ? 'destination-out' : 'source-over';
    context.strokeStyle = '#000000';
    drawStroke(context, stroke);
  }

  return canvas.toDataURL('image/png');
}

export function MaskCanvas({
  image,
  strokes,
  mode,
  brushSize,
  isDisabled,
  showMask,
  onStrokeEnd,
}) {
  const canvasRef = useRef(null);
  const activeStroke = useRef(null);

  useEffect(() => {
    redraw();
  });

  function toImagePoint(event) {
    const rect = canvasRef.current.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * image.width,
      y: ((event.clientY - rect.top) / rect.height) * image.height,
    };
  }

  function redraw() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of [...strokes, activeStroke.current].filter(Boolean)) {
      context.globalCompositeOperation =
        stroke.mode === 'paint' ? 'source-over' : 'destination-out';
      context.strokeStyle = '#887cff';
      drawStroke(context, stroke);
    }
  }

  function handlePointerDown(event) {
    if (isDisabled) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    activeStroke.current = {
      mode,
      size: brushSize,
      points: [toImagePoint(event)],
    };
    redraw();
  }

  function handlePointerMove(event) {
    if (!activeStroke.current) return;

    activeStroke.current.points.push(toImagePoint(event));
    redraw();
  }

  function handlePointerUp() {
    if (!activeStroke.current) return;

    const stroke = activeStroke.current;
    activeStroke.current = null;
    onStrokeEnd(stroke);
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <img
        src={image.url}
        alt="Image being edited"
        className="block w-full rounded-lg bg-muted select-none"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
        draggable={false}
      />
      <canvas
        ref={canvasRef}
        width={image.width}
        height={image.height}
        aria-label="Paint over the part you want to change"
        className="absolute inset-0 size-full touch-none rounded-lg"
        style={{
          opacity: showMask ? 0.55 : 0,
          cursor: isDisabled ? 'not-allowed' : 'crosshair',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
