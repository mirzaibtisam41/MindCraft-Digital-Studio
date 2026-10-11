'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';

export function SettingsSaveBar({ draft }) {
  const { isDirty, isSaving, discard, save } = draft;

  useEffect(() => {
    if (!isDirty) return;

    function warnBeforeLeaving(event) {
      event.preventDefault();
    }

    window.addEventListener('beforeunload', warnBeforeLeaving);

    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty]);

  return (
    <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-3 backdrop-blur">
      <p
        className="text-[12.5px] text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
      </p>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={discard}
          disabled={!isDirty || isSaving}
        >
          Discard
        </Button>
        <Button size="sm" onClick={save} disabled={!isDirty || isSaving}>
          {isSaving ? <Spinner /> : null}
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
