'use client';

import { useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function flattenImages(results) {
  return results.flatMap((generation) =>
    generation.images.map((image) => ({ generation, image })),
  );
}

function MetaLine({ generation, image }) {
  const { settings } = generation;

  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink-3">
      <div className="flex gap-1.5">
        <dt className="sr-only">Model</dt>
        <dd>{generation.model}</dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="sr-only">Size</dt>
        <dd>
          {image.width}×{image.height}
        </dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="sr-only">Quality</dt>
        <dd>{settings.quality}</dd>
      </div>
      {settings.style ? (
        <div className="flex gap-1.5">
          <dt className="sr-only">Style</dt>
          <dd>{settings.style}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function ResultsPanel({ results }) {
  const entries = flattenImages(results);
  const [selectedId, setSelectedId] = useState(null);
  const selected =
    entries.find(({ image }) => image.id === selectedId) ?? entries[0];

  if (!selected) return null;

  const { generation, image } = selected;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
          Results · this session
        </h2>
        <p className="font-mono text-xs text-ink-3">
          {entries.length} {entries.length === 1 ? 'image' : 'images'}
        </p>
      </div>

      <div
        className="flex items-center justify-center overflow-hidden rounded-xl border bg-card"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <img
          src={image.url}
          alt={generation.prompt}
          width={image.width}
          height={image.height}
          className="size-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="line-clamp-3 text-[13.5px]">{generation.prompt}</p>
        <MetaLine generation={generation} image={image} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <a href={image.url} download target="_blank" rel="noreferrer">
            <Download />
            Download
          </a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href={image.url} target="_blank" rel="noreferrer">
            <ExternalLink />
            Open full size
          </a>
        </Button>
      </div>

      {entries.length > 1 ? (
        <ul
          className="grid grid-cols-4 gap-2 sm:grid-cols-5"
          aria-label="Generated images"
        >
          {entries.map(({ generation: owner, image: thumb }) => (
            <li key={thumb.id}>
              <button
                type="button"
                aria-label={`Show image from “${owner.prompt}”`}
                aria-pressed={thumb.id === image.id}
                onClick={() => setSelectedId(thumb.id)}
                className={cn(
                  'block aspect-square w-full overflow-hidden rounded-lg border bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  thumb.id === image.id && 'border-brand ring-2 ring-brand/40',
                )}
              >
                <img
                  src={thumb.url}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
