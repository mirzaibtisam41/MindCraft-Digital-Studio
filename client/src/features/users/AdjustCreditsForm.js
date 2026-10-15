'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useAdjustUserCreditsMutation } from '@/features/users/usersApi';
import { getErrorMessage } from '@/lib/apiError';

const AMOUNT_LIMIT = 100000;

function validate({ amount, reason }) {
  const errors = {};
  const value = Number(amount);

  if (
    !/^-?\d+$/.test(amount) ||
    value === 0 ||
    Math.abs(value) > AMOUNT_LIMIT
  ) {
    errors.amount = `Use a whole number from -${AMOUNT_LIMIT.toLocaleString()} to ${AMOUNT_LIMIT.toLocaleString()}, not 0.`;
  }

  if (!reason.trim()) {
    errors.reason = 'Write why you are changing the credits.';
  }

  return errors;
}

export function AdjustCreditsForm({ userId }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [adjustUserCredits, { isLoading }] = useAdjustUserCreditsMutation();

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    const errors = validate({ amount, reason });
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const { transaction } = await adjustUserCredits({
        userId,
        amount: Number(amount),
        reason: reason.trim(),
      }).unwrap();

      toast.success(
        transaction.amount > 0
          ? `${transaction.amount.toLocaleString()} credits added`
          : `${Math.abs(transaction.amount).toLocaleString()} credits deducted`,
      );
      setAmount('');
      setReason('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">Adjust credits</h3>
        <p className="text-sm text-muted-foreground">
          Use a negative number to deduct credits. The reason is saved in the
          history.
        </p>
      </div>
      <FormAlert>{errorMessage}</FormAlert>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Field
          id="adjust-amount"
          label="Credits"
          error={fieldErrors.amount}
          className="sm:w-40"
        >
          <Input
            id="adjust-amount"
            type="number"
            placeholder="100"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={Boolean(fieldErrors.amount)}
          />
        </Field>
        <Field
          id="adjust-reason"
          label="Reason"
          error={fieldErrors.reason}
          className="flex-1"
        >
          <Input
            id="adjust-reason"
            maxLength={500}
            placeholder="Compensation for a failed generation"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-invalid={Boolean(fieldErrors.reason)}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner /> : null}
          Save adjustment
        </Button>
      </div>
    </form>
  );
}
