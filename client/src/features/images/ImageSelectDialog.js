'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyImagesQuery } from '@/features/images/imagesApi';

function ImageGrid({ onSelect }) {
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading } = useGetMyImagesQuery({
    page: 1,
    limit: 60,
    ...(search ? { search } : {}),
  });
  const images = data?.images ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
        <Input
          placeholder="Search prompts or file names"
          className="h-9 pl-9"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          aria-label="Search your images"
        />
      </div>
      <div className="max-h-[55vh] overflow-y-auto">
        {isLoading ? <Skeleton className="h-40 w-full" /> : null}
        {!isLoading && images.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No images found.
          </p>
        ) : null}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image)}
              aria-label={`Use ${image.prompt ?? image.originalFileName ?? 'image'}`}
              className="overflow-hidden rounded-lg border bg-muted transition-shadow hover:ring-2 hover:ring-brand"
            >
              <img
                src={image.thumbnailUrl}
                alt=""
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ImageSelectDialog({ open, onOpenChange, onSelect }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Pick from My Creations</DialogTitle>
        <DialogDescription>Choose the image to start from.</DialogDescription>
        {open ? (
          <ImageGrid
            onSelect={(image) => {
              onSelect(image);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
