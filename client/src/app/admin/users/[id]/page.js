import { UserDetailView } from '@/features/users/UserDetailView';

export const metadata = { title: 'User' };

export default async function UserPage({ params }) {
  const { id } = await params;

  return <UserDetailView userId={id} />;
}
