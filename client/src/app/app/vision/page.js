import { Suspense } from 'react';
import { VisionView } from '@/features/vision/VisionView';

export const metadata = { title: 'AI Vision' };

export default function VisionPage() {
  return (
    <Suspense>
      <VisionView />
    </Suspense>
  );
}
