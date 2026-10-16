'use client';

import { useSelector } from 'react-redux';
import { MailWarning } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useResendVerificationMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

export function VerifyEmailBanner() {
  const user = useSelector(selectCurrentUser);
  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  if (user.emailVerifiedAt) return null;

  async function resend() {
    try {
      const response = await resendVerification().unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm sm:flex-row sm:items-center"
    >
      <MailWarning className="size-5 shrink-0 text-warning" />
      <p className="flex-1">
        Confirm your email. We sent a link to{' '}
        <span className="font-medium">{user.email}</span>.
      </p>
      <Button size="sm" variant="outline" onClick={resend} disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        Send it again
      </Button>
    </div>
  );
}
