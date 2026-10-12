import { GenerationsView } from '@/features/admin/generations/GenerationsView';

export const metadata = { title: 'Generations' };

export default async function AdminGenerationsPage({ searchParams }) {
  const { userId } = await searchParams;

  return (
    <GenerationsView initialUserId={typeof userId === 'string' ? userId : ''} />
  );
}
