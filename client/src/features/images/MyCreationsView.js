'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePreviewDialog } from '@/features/images/ImagePreviewDialog';
import { ImageUploadDropzone } from '@/features/images/ImageUploadDropzone';
import { useGetMyImagesQuery } from '@/features/images/imagesApi';
import { getErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 24;

export function MyCreationsView() {
  const [page, setPage] = useState(1);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const { data, isLoading, isFetching, error } = useGetMyImagesQuery({
    page,
    limit: PAGE_SIZE,
  });

  const images = data?.images ?? [];
  const meta = data?.meta;
  const selectedImage =
    images.find((image) => image.id === selectedImageId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          My Creations
          {meta ? (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              {meta.total}
            </span>
          ) : null}
        </h1>
        <p className="text-muted-foreground">
          Your private images. Only you can see them.
        </p>
      </div>

      <ImageUploadDropzone />

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((tile) => (
            <Skeleton key={tile} className="aspect-square w-full" />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && images.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Nothing here yet. Upload an image to get started.
        </p>
      ) : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImageId(image.id)}
              className="group overflow-hidden rounded-xl border bg-muted focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              aria-label={`Open ${image.originalFileName ?? 'image'}`}
            >
              <img
                src={image.url}
                alt={image.originalFileName ?? 'Image'}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            </button>
          ))}
        </div>
      ) : null}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft />
            Previous
          </Button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages || isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      ) : null}

      <ImagePreviewDialog
        image={selectedImage}
        onOpenChange={(open) => {
          if (!open) setSelectedImageId(null);
        }}
      />
    </div>
  );
}
