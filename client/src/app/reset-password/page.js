import { Suspense } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

export const metadata = { title: 'Choose a new password' };

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="You will be logged out on every device"
      footer={<Link href="/login">Back to sign in</Link>}
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
