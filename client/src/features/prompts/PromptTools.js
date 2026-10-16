'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';
import {
  useEnhancePromptMutation,
  useGetPromptOptionsQuery,
} from '@/features/prompts/promptsApi';
import { SavePromptDialog } from '@/features/prompts/SavePromptDialog';
import { getErrorMessage } from '@/lib/apiError';

export function PromptTools({ prompt, onPromptChange, disabled }) {
  const [promptBeforeEnhance, setPromptBeforeEnhance] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState(null);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const { data: options } = useGetPromptOptionsQuery();
  const [enhancePrompt, { isLoading: isEnhancing }] =
    useEnhancePromptMutation();
  const hasPrompt = prompt.trim().length > 0;
  const canUndo = promptBeforeEnhance !== null && prompt === enhancedPrompt;

  async function enhance() {
    try {
      const result = await enhancePrompt({ prompt: prompt.trim() }).unwrap();
      setPromptBeforeEnhance(prompt);
      setEnhancedPrompt(result.enhancedPrompt);
      onPromptChange(result.enhancedPrompt);
      toast.success(
        `Prompt enhanced · +${result.addedDescriptors.length} descriptors`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function undo() {
    onPromptChange(promptBeforeEnhance);
    setPromptBeforeEnhance(null);
    setEnhancedPrompt(null);
  }

  return (
    <>
      {canUndo ? (
        <button
          type="button"
          className="hover:text-foreground"
          onClick={undo}
          disabled={disabled}
        >
          Undo
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-brand hover:text-foreground disabled:opacity-50"
          onClick={enhance}
          disabled={disabled || !hasPrompt || isEnhancing}
        >
          {isEnhancing ? <Spinner className="size-3" /> : null}
          {isEnhancing ? 'Enhancing…' : 'Enhance'}
        </button>
      )}
      {hasPrompt ? (
        <button
          type="button"
          className="hover:text-foreground"
          onClick={() => setIsSaveOpen(true)}
          disabled={disabled}
        >
          Save
        </button>
      ) : null}
      <SavePromptDialog
        open={isSaveOpen}
        text={prompt}
        style={null}
        categories={options?.categories ?? []}
        onOpenChange={setIsSaveOpen}
      />
    </>
  );
}
