import { Check, Circle } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/validators';
import { cn } from '@/lib/utils';

export function PasswordRules({ value }) {
  return (
    <ul className="flex flex-col gap-1" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value);

        return (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2 text-xs',
              passed ? 'text-success' : 'text-ink-3',
            )}
          >
            {passed ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Circle className="size-3.5" aria-hidden="true" />
            )}
            <span>{rule.label}</span>
            <span className="sr-only">
              {passed ? '(met)' : '(not met yet)'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
