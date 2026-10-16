'use client';

import { useRef, useState } from 'react';
import { ImageUp, Images, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';
import { ImageSelectDialog } from '@/features/images/ImageSelectDialog';
import { useUploadImageMutation } from '@/features/images/imagesApi';
import { getErrorMessage } from '@/lib/apiError';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 25 * 1024 * 1024;

export function SourceImagePanel({ label, image, onChange, isDisabled }) {
  const inputRef = useRef(null);
  const [isPicking, setIsPicking] = useState(false);
  const [uploadImage, { isLoading }] = useUploadImageMutation();

  async function handleFile(file) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      toast.error(
        `${file.name} isn't supported. Use PNG, JPG or WebP under 25 MB.`,
      );
      return;
    }

    try {
      onChange(await uploadImage(file).unwrap());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {image ? (
        <div className="flex items-center gap-3 rounded-lg border bg-background p-2">
          <img
            src={image.thumbnailUrl}
            alt=""
            className="size-16 rounded-md object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">
              {image.originalFileName ?? image.prompt ?? 'Image'}
            </span>
            <span className="text-xs text-ink-3">
              {image.width} × {image.height}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove image"
            disabled={isDisabled}
            onClick={() => onChange(null)}
          >
            <X />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files[0]);
          }}
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-5 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Drop an image here · PNG, JPG or WebP · up to 25 MB
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || isDisabled}
              onClick={() => inputRef.current?.click()}
            >
              {isLoading ? <Spinner /> : <ImageUp />}
              {isLoading ? 'Uploading…' : 'Upload image'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => setIsPicking(true)}
            >
              <Images />
              Pick from My Creations
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(event) => {
              handleFile(event.target.files[0]);
              event.target.value = '';
            }}
          />
        </div>
      )}
      <ImageSelectDialog
        open={isPicking}
        onOpenChange={setIsPicking}
        onSelect={onChange}
      />
    </div>
  );
}
