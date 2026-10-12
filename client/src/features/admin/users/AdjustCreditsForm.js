'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useAdjustAdminUserCreditsMutation } from '@/features/admin/adminApi';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { getErrorMessage } from '@/lib/apiError';

const AMOUNT_LIMIT = 100000;
const REASON_MIN_LENGTH = 3;
const REASON_MAX_LENGTH = 200;

export function AdjustCreditsForm({ user }) {
  const [adjustCredits, { isLoading }] = useAdjustAdminUserCreditsMutation();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const parsed = Number(amount);
    const nextErrors = {};

    if (
      amount.trim() === '' ||
      !Number.isInteger(parsed) ||
      parsed === 0 ||
      Math.abs(parsed) > AMOUNT_LIMIT
    ) {
      nextErrors.amount = `Enter a non-zero whole number up to ${AMOUNT_LIMIT} (use a minus sign to remove credits).`;
    }

    if (reason.trim().length < REASON_MIN_LENGTH) {
      nextErrors.reason = `Give a reason of at least ${REASON_MIN_LENGTH} characters.`;
    }

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    try {
      const result = await adjustCredits({
        id: user.id,
        body: { amount: parsed, reason: reason.trim() },
      }).unwrap();

      toast.success(`Balance is now ${result.creditBalance} credits`);
      setAmount('');
      setReason('');
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SettingsCard
        title="Adjust credits"
        description={`Current balance: ${user.creditBalance} credits. Positive numbers add credits, negative numbers remove them.`}
        footer={
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : null}
            Apply adjustment
          </Button>
        }
      >
        <FormAlert>{formError}</FormAlert>
        <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
          <Field id="adjust-amount" label="Amount" error={errors.amount}>
            <Input
              id="adjust-amount"
              type="number"
              inputMode="numeric"
              className="h-10 font-mono"
              placeholder="e.g. 25 or -10"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={
                errors.amount ? 'adjust-amount-error' : undefined
              }
            />
          </Field>
          <Field id="adjust-reason" label="Reason" error={errors.reason}>
            <Input
              id="adjust-reason"
              className="h-10"
              maxLength={REASON_MAX_LENGTH}
              placeholder="Why are you changing this balance?"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-invalid={Boolean(errors.reason)}
              aria-describedby={
                errors.reason ? 'adjust-reason-error' : undefined
              }
            />
          </Field>
        </div>
      </SettingsCard>
    </form>
  );
}
