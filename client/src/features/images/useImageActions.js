'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useGetImageDownloadUrlMutation,
  useSetImageFavoriteMutation,
} from '@/features/images/imagesApi';
import { getErrorMessage } from '@/lib/apiError';

export function useImageActions() {
  const router = useRouter();
  const [setImageFavorite] = useSetImageFavoriteMutation();
  const [getImageDownloadUrl] = useGetImageDownloadUrlMutation();

  async function toggleFavorite(image) {
    try {
      await setImageFavorite({
        id: image.id,
        isFavorite: !image.isFavorite,
      }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function download(image) {
    try {
      const url = await getImageDownloadUrl(image.id).unwrap();
      window.location.assign(url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function reusePrompt(image) {
    const params = new URLSearchParams({ prompt: image.prompt });

    if (image.model?.id) params.set('modelId', image.model.id);

    router.push(`/app/generate?${params}`);
  }

  function editImage(image) {
    router.push(`/app/editor?imageId=${image.id}`);
  }

  function makeVariations(image) {
    router.push(`/app/image-to-image?imageId=${image.id}`);
  }

  function analyzeImage(image) {
    router.push(`/app/vision?imageId=${image.id}`);
  }

  return {
    toggleFavorite,
    download,
    reusePrompt,
    editImage,
    makeVariations,
    analyzeImage,
  };
}
