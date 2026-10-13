import Link from 'next/link';
import { BrandMark } from '@/components/layout/BrandMark';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[radial-gradient(60%_50%_at_50%_0%,var(--brand-tint),transparent)] px-4 text-center">
      <BrandMark className="size-12" />
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-semibold tracking-tight">
          Mindcraft Digital Studio
        </h1>
        <p className="max-w-md text-muted-foreground">
          Generate, edit, transform, analyze and organize AI images with natural
          language.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/register">Create account</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
