import { GenerationDetailView } from '@/features/admin/generations/GenerationDetailView';

export const metadata = { title: 'Generation' };

export default async function AdminGenerationDetailPage({ params }) {
  const { id } = await params;

  return <GenerationDetailView id={id} />;
}
