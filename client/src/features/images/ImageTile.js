'use client';

import { Brush, Check, Download, Heart, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function TileAction({ label, onClick, children, isActive }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80',
        isActive && 'text-danger',
      )}
    >
      {children}
    </button>
  );
}

export function ImageTile({
  image,
  isSelecting,
  isSelected,
  onOpen,
  onToggleSelect,
  actions,
}) {
  const label = image.prompt ?? image.originalFileName ?? 'Image';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-muted',
        isSelected && 'ring-2 ring-brand',
      )}
    >
      <button
        type="button"
        onClick={() => (isSelecting ? onToggleSelect(image) : onOpen(image))}
        aria-label={isSelecting ? `Select ${label}` : `Open ${label}`}
        aria-pressed={isSelecting ? isSelected : undefined}
        className="block w-full focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        <img
          src={image.thumbnailUrl}
          alt={label}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.02]"
        />
      </button>

      {isSelecting ? (
        <span
          className={cn(
            'pointer-events-none absolute top-2 left-2 flex size-6 items-center justify-center rounded-md border-2 border-white bg-black/40',
            isSelected && 'border-brand bg-brand',
          )}
        >
          {isSelected ? <Check className="size-4 text-white" /> : null}
        </span>
      ) : (
        <>
          {image.isFavorite ? (
            <Heart className="pointer-events-none absolute top-2 left-2 size-5 fill-danger text-danger drop-shadow group-hover:opacity-0" />
          ) : null}
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <TileAction
              label={
                image.isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
              isActive={image.isFavorite}
              onClick={() => actions.toggleFavorite(image)}
            >
              <Heart
                className={cn('size-4', image.isFavorite && 'fill-current')}
              />
            </TileAction>
            <TileAction
              label="Download"
              onClick={() => actions.download(image)}
            >
              <Download className="size-4" />
            </TileAction>
            <TileAction label="Edit" onClick={() => actions.editImage(image)}>
              <Brush className="size-4" />
            </TileAction>
            {image.prompt ? (
              <TileAction
                label="Reuse prompt"
                onClick={() => actions.reusePrompt(image)}
              >
                <Wand2 className="size-4" />
              </TileAction>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
