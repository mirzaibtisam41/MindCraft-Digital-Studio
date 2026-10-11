'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PasswordInput({ ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className="h-10 pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1 right-1 text-muted-foreground"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
