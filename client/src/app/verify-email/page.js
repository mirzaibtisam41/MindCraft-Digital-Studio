import { Suspense } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { VerifyEmailView } from '@/features/auth/VerifyEmailView';

export const metadata = { title: 'Confirm your email' };

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Confirm your email"
      subtitle="One click and your account is confirmed"
    >
      <Suspense>
        <VerifyEmailView />
      </Suspense>
    </AuthLayout>
  );
}
