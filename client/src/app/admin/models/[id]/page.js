import { AiModelDetailView } from '@/features/ai-models/AiModelDetailView';

export const metadata = { title: 'AI Model' };

export default async function AiModelPage({ params }) {
  const { id } = await params;

  return <AiModelDetailView modelId={id} />;
}
