import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackLink({ href, children }) {
  return (
    <Button asChild variant="ghost" size="sm" className="self-start">
      <Link href={href}>
        <ArrowLeft />
        {children}
      </Link>
    </Button>
  );
}
