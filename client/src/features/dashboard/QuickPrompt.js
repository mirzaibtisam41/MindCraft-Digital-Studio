'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickPrompt() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const trimmed = prompt.trim();
    const query = trimmed ? `?prompt=${encodeURIComponent(trimmed)}` : '';

    router.push(`/app/generate${query}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Quick prompt"
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
    >
      <label htmlFor="quick-prompt" className="sr-only">
        Describe an image
      </label>
      <input
        id="quick-prompt"
        type="text"
        value={prompt}
        maxLength={4000}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe an image to create…"
        className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-ink-3 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:border-input dark:bg-input/30"
      />
      <Button type="submit" size="lg">
        <Sparkles />
        Create image
      </Button>
    </form>
  );
}
