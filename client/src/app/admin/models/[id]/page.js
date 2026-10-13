import { ModelDetailView } from '@/features/admin/models/ModelDetailView';

export const metadata = { title: 'Model' };

export default async function AdminModelDetailPage({ params }) {
  const { id } = await params;

  return <ModelDetailView id={decodeURIComponent(id)} />;
}
