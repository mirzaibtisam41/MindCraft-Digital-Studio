'use client';

import { useRef, useState } from 'react';
import { ImageUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { useUploadImageMutation } from '@/features/images/imagesApi';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 25 * 1024 * 1024;

function findFileProblem(file) {
  if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
    return `${file.name} isn't supported. Use PNG, JPG or WebP under 25 MB.`;
  }

  return '';
}

export function ImageUploadDropzone() {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadImage, { isLoading }] = useUploadImageMutation();

  async function handleFile(file) {
    if (!file) return;

    const problem = findFileProblem(file);
    setErrorMessage(problem);

    if (problem) return;

    try {
      await uploadImage(file).unwrap();
      toast.success(`${file.name} uploaded`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    if (!isLoading) handleFile(event.dataTransfer.files[0]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors',
          isDragging && 'border-brand bg-brand-tint/40',
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-brand">
          {isLoading ? <Spinner /> : <ImageUp className="size-5" />}
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            {isLoading ? 'Uploading…' : 'Drop an image here'}
          </p>
          <p className="text-sm text-muted-foreground">
            PNG, JPG or WebP · up to 25 MB · stays private
          </p>
        </div>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
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
      <FormAlert>{errorMessage}</FormAlert>
    </div>
  );
}
