'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { FolderKanban, ImagePlus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { useCompleteOnboardingMutation } from '@/features/settings/settingsApi';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: ImagePlus,
    title: 'Generate',
    text: 'Describe an image in your own words and get it in seconds. You always see the cost before you press Generate.',
  },
  {
    icon: Wand2,
    title: 'Edit',
    text: 'Paint over a part of a picture and say what should change, or turn a whole picture into something new.',
  },
  {
    icon: FolderKanban,
    title: 'Organize',
    text: 'Favorites, projects and collections keep your work together, and every prompt can be reused later.',
  },
];

const FIRST_PROMPTS = [
  'A cozy cabin in a snowy forest at dusk',
  'A cute robot watering plants, 3D render',
  'A cup of coffee on a wooden table, morning light',
];

export function OnboardingDialog() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const { data: wallet } = useGetMyWalletQuery({ page: 1, limit: 1 });
  const [completeOnboarding] = useCompleteOnboardingMutation();
  const [stepIndex, setStepIndex] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  if (user.onboardingCompletedAt || isClosed) return null;

  function finish(nextPath) {
    setIsClosed(true);
    completeOnboarding();

    if (nextPath) router.push(nextPath);
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) finish();
      }}
    >
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <div className="flex flex-col gap-1 bg-linear-to-br from-brand-from to-brand-to px-6 pt-7 pb-6 text-white">
          <DialogTitle className="text-xl font-semibold">
            Welcome, {user.name.split(' ')[0]}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Here is what you can do in Mindcraft Digital Studio.
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
              <step.icon className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </div>
          </div>

          {stepIndex === 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-ink-3">
                Try a first prompt
              </p>
              <div className="flex flex-wrap gap-2">
                {FIRST_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() =>
                      finish(`/app/generate?${new URLSearchParams({ prompt })}`)
                    }
                    className="rounded-full border px-3 py-1.5 text-left text-sm transition-colors hover:border-brand/60 hover:bg-brand-tint hover:text-brand"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-ink-3">
            <span className="flex gap-1.5" aria-hidden="true">
              {STEPS.map((item, index) => (
                <span
                  key={item.title}
                  className={cn(
                    'size-2 rounded-full',
                    index === stepIndex ? 'bg-brand' : 'bg-muted',
                  )}
                />
              ))}
            </span>
            <span>
              {stepIndex + 1} of {STEPS.length}
              {wallet
                ? ` · ${wallet.balance.toLocaleString()} ${wallet.balance === 1 ? 'credit' : 'credits'} to start with`
                : ''}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => finish()}>
              Skip
            </Button>
            <div className="flex gap-2">
              {stepIndex > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => setStepIndex(stepIndex - 1)}
                >
                  Back
                </Button>
              ) : null}
              {isLastStep ? (
                <Button onClick={() => finish('/app/generate')}>
                  Start creating
                </Button>
              ) : (
                <Button onClick={() => setStepIndex(stepIndex + 1)}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
