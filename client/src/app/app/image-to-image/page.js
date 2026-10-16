import { Suspense } from 'react';
import { ImageToImageView } from '@/features/editing/ImageToImageView';

export const metadata = { title: 'Image to Image' };

export default function ImageToImagePage() {
  return (
    <Suspense>
      <ImageToImageView />
    </Suspense>
  );
}
