'use client';

import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { selectCurrentUser } from '@/features/auth/authSlice';

export function ProfileCard() {
  const user = useSelector(selectCurrentUser);

  const rows = [
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    {
      label: 'Role',
      value: (
        <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>
          {user.role === 'admin' ? 'Admin' : 'User'}
        </Badge>
      ),
    },
    {
      label: 'Member since',
      value: new Date(user.createdAt).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      }),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>The account you are logged in with.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-[140px_1fr]">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-sm text-ink-3">{row.label}</dt>
              <dd className="text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
