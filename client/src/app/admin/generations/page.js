import { GenerationsView } from '@/features/admin/generations/GenerationsView';

export const metadata = { title: 'Generations' };

function readParam(value) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminGenerationsPage({ searchParams }) {
  const { userId, model } = await searchParams;

  return (
    <GenerationsView
      initialUserId={readParam(userId)}
      initialModel={readParam(model)}
    />
  );
}
