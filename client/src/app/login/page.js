import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GuestGuard } from '@/components/layout/GuestGuard';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <GuestGuard>
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to your creative workspace"
        footer={
          <>
            New to Mindcraft? <Link href="/register">Create an account</Link>
          </>
        }
      >
        <LoginForm />
      </AuthLayout>
    </GuestGuard>
  );
}
