import { CircleAlert, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/apiError';
import { formatCredits } from '@/lib/credits';

const INSUFFICIENT_CREDITS_CODE = 'INSUFFICIENT_CREDITS';

export function InsufficientCreditsNotice({
  cost,
  balance,
  maxAffordableCount,
  onUseCount,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4"
    >
      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-warning">Not enough credits</p>
          <p className="text-[12.5px] text-muted-foreground">
            This batch needs {formatCredits(cost.total)}, you have {balance}.
          </p>
        </div>
      </div>
      {maxAffordableCount > 0 ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => onUseCount(maxAffordableCount)}
        >
          Generate {maxAffordableCount}{' '}
          {maxAffordableCount === 1 ? 'image' : 'images'} instead
        </Button>
      ) : null}
    </div>
  );
}

export function FailureNotice({ error, onDismiss }) {
  const isCredits = error?.data?.code === INSUFFICIENT_CREDITS_CODE;

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4"
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-danger">
            {isCredits ? 'Not enough credits' : 'Generation failed'}
          </p>
          <p className="text-[12.5px] text-muted-foreground">
            {getErrorMessage(error)} Nothing was charged.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  );
}
