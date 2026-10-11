import { NotFoundView } from '@/components/layout/NotFoundView';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <NotFoundView />
    </main>
  );
}
