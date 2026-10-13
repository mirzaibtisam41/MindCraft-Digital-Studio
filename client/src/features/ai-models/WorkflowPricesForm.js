'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useSaveWorkflowPricesMutation } from '@/features/ai-models/modelPricesApi';
import { getErrorMessage } from '@/lib/apiError';

function buildInitialValues(qualities, prices) {
  return Object.fromEntries(
    qualities.map((quality) => {
      const price = prices.find((item) => item.quality === quality);

      return [quality, price ? String(price.creditsPerImage) : ''];
    }),
  );
}

export function WorkflowPricesForm({ modelId, typeId, qualities, prices }) {
  const [values, setValues] = useState(() =>
    buildInitialValues(qualities, prices),
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [saveWorkflowPrices, { isLoading }] = useSaveWorkflowPricesMutation();

  async function handleSave() {
    setErrorMessage('');

    const filled = Object.entries(values).filter(([, value]) => value !== '');
    const invalid = filled.find(([, value]) => !/^[1-9]\d*$/.test(value));

    if (invalid) {
      setErrorMessage(`Use a whole number above 0 for ${invalid[0]}.`);

      return;
    }

    try {
      await saveWorkflowPrices({
        modelId,
        typeId,
        prices: Object.fromEntries(
          filled.map(([quality, value]) => [quality, Number(value)]),
        ),
      }).unwrap();
      toast.success('Prices saved');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Coins className="size-4 text-ink-3" />
        <p className="text-sm font-medium">Credits per image</p>
      </div>
      <p className="text-xs text-ink-3">
        Every enabled quality needs a price before the model can be activated.
      </p>

      <FormAlert>{errorMessage}</FormAlert>

      <div className="grid gap-3 sm:grid-cols-3">
        {qualities.map((quality) => (
          <label key={quality} className="flex flex-col gap-1.5 text-sm">
            <span className="text-ink-3 capitalize">{quality}</span>
            <Input
              type="number"
              min="1"
              placeholder="Not set"
              className="h-9"
              value={values[quality]}
              onChange={(event) =>
                setValues({ ...values, [quality]: event.target.value })
              }
            />
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Spinner /> : null}
          Save prices
        </Button>
      </div>
    </div>
  );
}
