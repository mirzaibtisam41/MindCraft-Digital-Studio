import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GuestGuard } from '@/components/layout/GuestGuard';
import { RegisterForm } from '@/features/auth/RegisterForm';

export const metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <GuestGuard>
      <AuthLayout
        title="Create your account"
        subtitle="Generate, edit and organize AI images in one place"
        footer={
          <>
            Already have an account? <Link href="/login">Sign in</Link>
          </>
        }
      >
        <RegisterForm />
      </AuthLayout>
    </GuestGuard>
  );
}
