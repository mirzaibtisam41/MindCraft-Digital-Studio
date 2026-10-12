import { GeneratorView } from '@/features/generator/GeneratorView';

export const metadata = { title: 'Image Generator' };

export default async function GeneratePage({ searchParams }) {
  const { prompt } = await searchParams;
  const initialPrompt = typeof prompt === 'string' ? prompt.slice(0, 4000) : '';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Image Generator
        </h1>
        <p className="text-muted-foreground">
          Turn a prompt into images. The cost is shown before you run.
        </p>
      </div>
      <GeneratorView initialPrompt={initialPrompt} />
    </div>
  );
}
