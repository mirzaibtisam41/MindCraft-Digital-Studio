import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GuestGuard } from '@/components/layout/GuestGuard';
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';

export const metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <AuthLayout
        title="Forgot your password?"
        subtitle="We will email you a link to choose a new one"
        footer={
          <>
            Remembered it? <Link href="/login">Back to sign in</Link>
          </>
        }
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </GuestGuard>
  );
}
