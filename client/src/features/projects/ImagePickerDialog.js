'use client';

import { useEffect, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { useGetMyImagesQuery } from '@/features/images/imagesApi';
import { useAddProjectImagesMutation } from '@/features/projects/projectsApi';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

function Picker({ projectId, collectionId, existingIds, onDone }) {
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [addProjectImages, { isLoading }] = useAddProjectImagesMutation();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading: isLoadingImages } = useGetMyImagesQuery({
    page: 1,
    limit: 60,
    ...(search ? { search } : {}),
  });
  const images = (data?.images ?? []).filter(
    (image) => !existingIds.includes(image.id),
  );

  function toggle(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function handleAdd() {
    try {
      const addedIds = await addProjectImages({
        projectId,
        imageIds: selectedIds,
        collectionId,
      }).unwrap();
      toast.success(
        addedIds.length === 1
          ? '1 image added'
          : `${addedIds.length} images added`,
      );
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

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

      <div className="max-h-[50vh] overflow-y-auto">
        {isLoadingImages ? <Skeleton className="h-40 w-full" /> : null}
        {!isLoadingImages && images.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No more images to add.
          </p>
        ) : null}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image) => {
            const isSelected = selectedIds.includes(image.id);

            return (
              <button
                key={image.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Select ${image.prompt ?? image.originalFileName ?? 'image'}`}
                onClick={() => toggle(image.id)}
                className={cn(
                  'relative overflow-hidden rounded-lg border bg-muted',
                  isSelected && 'ring-2 ring-brand',
                )}
              >
                <img
                  src={image.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <span
                  className={cn(
                    'absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded border-2 border-white bg-black/40',
                    isSelected && 'border-brand bg-brand',
                  )}
                >
                  {isSelected ? (
                    <Check className="size-3.5 text-white" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <DialogFooter>
        <Button
          disabled={selectedIds.length === 0 || isLoading}
          onClick={handleAdd}
        >
          {isLoading ? <Spinner /> : null}
          Add {selectedIds.length || ''}{' '}
          {selectedIds.length === 1 ? 'image' : 'images'}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function ImagePickerDialog({
  open,
  projectId,
  collectionId,
  existingIds,
  onOpenChange,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Add from My Creations</DialogTitle>
        <DialogDescription>
          Pick the images to add to this project.
        </DialogDescription>
        {open ? (
          <Picker
            projectId={projectId}
            collectionId={collectionId}
            existingIds={existingIds}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
