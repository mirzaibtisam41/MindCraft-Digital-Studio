import { UserDetailView } from '@/features/admin/users/UserDetailView';

export const metadata = { title: 'User' };

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;

  return <UserDetailView id={id} />;
}
