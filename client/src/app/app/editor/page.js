import { Suspense } from 'react';
import { ImageEditorView } from '@/features/editing/ImageEditorView';

export const metadata = { title: 'Image Editor' };

export default function ImageEditorPage() {
  return (
    <Suspense>
      <ImageEditorView />
    </Suspense>
  );
}
