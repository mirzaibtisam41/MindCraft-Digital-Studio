import { Suspense } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

export const metadata = { title: 'Reset password' };

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least 8 characters with a letter and a number"
      footer={<Link href="/login">Back to sign in</Link>}
    >
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
